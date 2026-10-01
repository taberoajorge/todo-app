#!/usr/bin/env node

const { execFile } = require('node:child_process');
const process = require('node:process');
const { promisify } = require('node:util');

const commitlintConfig = require('../../config/commitlint.config.cjs');

const execFileAsync = promisify(execFile);

const DEFAULT_BASE = 'origin/main';
const DEFAULT_HEAD = 'HEAD';
const MAX_CHANGED_LINES = 100;
const EXCEPTION_TRAILER = 'Commit-Exception:';
const TRAILER_LINE_PATTERN = /^[A-Za-z][A-Za-z0-9-]*:\s*.*$/u;

const GENERIC_MESSAGES = new Set(['wip', 'tmp', 'temp', 'update', 'misc', 'fix stuff']);
const BLOCKED_PREFIX_PATTERNS = [
  { label: 'fixup!', test: /^fixup!/u },
  { label: 'squash!', test: /^squash!/u },
  { label: 'WIP', test: /^wip(?:\b|[:! -])/u },
];
const FORMAT_EXEMPT_PREFIXES = ['merge ', 'revert "'];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function getRuleValue(ruleName, fallback) {
  const rule = commitlintConfig.rules?.[ruleName];
  return Array.isArray(rule) && rule.length >= 3 ? rule[2] : fallback;
}

const ALLOWED_SCOPES = new Set(getRuleValue('scope-enum', []));
const ALLOWED_TYPES = new Set(getRuleValue('type-enum', []));
const HEADER_MAX_LENGTH = getRuleValue('header-max-length', 100);

function normalizeMessagePart(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/gu, ' ')
    .replace(/^["'`]+|["'`]+$/gu, '');
}

function getCommitHeader(message) {
  return (
    message
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith('#')) ?? ''
  );
}

function getSemanticTarget(header) {
  const separatorIndex = header.indexOf(':');

  if (separatorIndex === -1) {
    return normalizeMessagePart(header);
  }

  return normalizeMessagePart(header.slice(separatorIndex + 1));
}

function getCommitSubject(header) {
  const separatorIndex = header.indexOf(':');
  return separatorIndex === -1 ? header.trim() : header.slice(separatorIndex + 1).trim();
}

function sanitizeMessage(message) {
  return message
    .split(/\r?\n/u)
    .filter((line) => !line.trimStart().startsWith('#'))
    .join('\n');
}

function getFooterLines(message) {
  const lines = sanitizeMessage(message).split(/\r?\n/u);
  const footerLines = [];

  let index = lines.length - 1;

  while (index >= 0 && lines[index].trim().length === 0) {
    index -= 1;
  }

  let foundTrailer = false;

  for (; index >= 0; index -= 1) {
    const line = lines[index];

    if (line.trim().length === 0) {
      if (foundTrailer) {
        break;
      }

      continue;
    }

    if (/^\s+/u.test(line)) {
      if (!foundTrailer) {
        break;
      }

      footerLines.unshift(line);
      continue;
    }

    if (TRAILER_LINE_PATTERN.test(line)) {
      foundTrailer = true;
      footerLines.unshift(line);
      continue;
    }

    break;
  }

  return foundTrailer ? footerLines : [];
}

function getCommitException(message) {
  const lines = getFooterLines(message);

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^Commit-Exception:\s*(.*)$/u);

    if (!match) {
      continue;
    }

    const sameLineValue = match[1].trim();

    if (sameLineValue.length > 0) {
      return sameLineValue;
    }

    const continuationLines = [];

    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      const nextLine = lines[nextIndex];

      if (/^\S[^:]*:\s*/u.test(nextLine)) {
        break;
      }

      if (nextLine.trim().length === 0) {
        if (continuationLines.length === 0) {
          continue;
        }

        break;
      }

      if (!/^\s+/u.test(nextLine)) {
        break;
      }

      continuationLines.push(nextLine.trim());
    }

    const continuationValue = continuationLines.join(' ').trim();
    return continuationValue.length > 0 ? continuationValue : '';
  }

  return null;
}

function parseArguments(argv) {
  const options = {
    base: DEFAULT_BASE,
    head: DEFAULT_HEAD,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '-h') {
      return { help: true, ...options };
    }

    if (argument.startsWith('--base=')) {
      options.base = argument.slice('--base='.length);
      continue;
    }

    if (argument.startsWith('--head=')) {
      options.head = argument.slice('--head='.length);
      continue;
    }

    if (argument === '--base') {
      options.base = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (argument === '--head') {
      options.head = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    fail(
      `Unknown argument "${argument}".\nUsage: node scripts/commit/audit-branch-history.cjs [--base=<ref>] [--head=<ref>]`,
    );
  }

  if (!options.base || !options.head) {
    fail(
      `Both --base and --head require a value.\nUsage: node scripts/commit/audit-branch-history.cjs [--base=<ref>] [--head=<ref>]`,
    );
  }

  return {
    help: false,
    ...options,
  };
}

async function runGit(args) {
  try {
    const { stdout } = await execFileAsync('git', args);
    return stdout;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`git ${args.join(' ')} failed: ${reason}`);
  }
}

async function getCommitsInRange(base, head) {
  const range = `${base}..${head}`;
  const stdout = await runGit(['log', '--reverse', '--format=%H%x1f%s', range]);

  return stdout
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => {
      const [sha = '', subject = ''] = line.split('\u001f');
      return { sha, subject };
    });
}

async function getCommitMessage(sha) {
  return runGit(['show', '--quiet', '--format=%B', sha]);
}

async function getCommitLineStats(sha) {
  const stdout = await runGit(['show', '--format=', '--numstat', sha]);

  let added = 0;
  let deleted = 0;

  for (const line of stdout.split(/\r?\n/u)) {
    if (!line.trim()) {
      continue;
    }

    const [addedRaw = '0', deletedRaw = '0'] = line.split('\t');

    if (addedRaw === '-' || deletedRaw === '-') {
      continue;
    }

    added += Number.parseInt(addedRaw, 10);
    deleted += Number.parseInt(deletedRaw, 10);
  }

  return {
    added,
    deleted,
    total: added + deleted,
  };
}

function findBlockedPrefix(header) {
  const subject = getCommitSubject(header);
  const normalizedHeader = normalizeMessagePart(header);
  const normalizedSubject = normalizeMessagePart(subject);

  return (
    BLOCKED_PREFIX_PATTERNS.find(
      ({ test }) =>
        test.test(normalizedHeader) || test.test(normalizedSubject),
    ) ?? null
  )?.label;
}

function isFormatExempt(header) {
  const normalizedHeader = normalizeMessagePart(header);
  return FORMAT_EXEMPT_PREFIXES.some((prefix) => normalizedHeader.startsWith(prefix));
}

function validateHeader(header) {
  const violations = [];

  if (!header) {
    violations.push('missing commit header');
    return violations;
  }

  if (isFormatExempt(header)) {
    return violations;
  }

  if (header.length > HEADER_MAX_LENGTH) {
    violations.push(`header exceeds ${HEADER_MAX_LENGTH} characters`);
  }

  const match = header.match(/^(?<type>[A-Za-z]+)\((?<scope>[^()\s]+)\)(?<breaking>!)?: (?<subject>.+)$/u);

  if (!match?.groups) {
    violations.push('header must match "type(scope): subject"');
    return violations;
  }

  const { type, scope, subject } = match.groups;

  if (type !== type.toLowerCase()) {
    violations.push('type must be lowercase');
  }

  if (!ALLOWED_TYPES.has(type.toLowerCase())) {
    violations.push(`type "${type}" is not allowed`);
  }

  if (!ALLOWED_SCOPES.has(scope)) {
    violations.push(`scope "${scope}" is not allowed`);
  }

  if (subject.trim().length === 0) {
    violations.push('subject must not be empty');
  }

  const semanticTarget = getSemanticTarget(header);

  if (GENERIC_MESSAGES.has(semanticTarget)) {
    violations.push(`subject "${semanticTarget}" is too generic`);
  }

  return violations;
}

async function auditCommit(commit) {
  const message = await getCommitMessage(commit.sha);
  const header = getCommitHeader(message);
  const subject = header || commit.subject;
  const violations = [];

  const blockedPrefix = findBlockedPrefix(header);

  if (blockedPrefix) {
    violations.push(`subject uses blocked prefix "${blockedPrefix}"`);
  }

  violations.push(...validateHeader(header));

  const { added, deleted, total } = await getCommitLineStats(commit.sha);
  const exception = getCommitException(message);

  if (total > MAX_CHANGED_LINES && !exception) {
    violations.push(
      `changed lines ${total} (${added} added, ${deleted} deleted) exceed ${MAX_CHANGED_LINES} without ${EXCEPTION_TRAILER}`,
    );
  }

  return {
    sha: commit.sha,
    subject,
    violations,
  };
}

function printHelp() {
  console.log(
    [
      'Usage: node scripts/commit/audit-branch-history.cjs [--base=<ref>] [--head=<ref>]',
      `Defaults: --base=${DEFAULT_BASE} --head=${DEFAULT_HEAD}`,
      'Audits commits in chronological order using the same range semantics as git log base..head.',
    ].join('\n'),
  );
}

async function main() {
  const { base, head, help } = parseArguments(process.argv.slice(2));

  if (help) {
    printHelp();
    return;
  }

  const commits = await getCommitsInRange(base, head);
  const range = `${base}..${head}`;

  if (commits.length === 0) {
    console.log(`No commits to audit in range ${range}.`);
    return;
  }

  let failingCommits = 0;

  for (const commit of commits) {
    const result = await auditCommit(commit);

    if (result.violations.length === 0) {
      console.log(`OK   ${result.sha} :: ${result.subject}`);
      continue;
    }

    failingCommits += 1;

    for (const violation of result.violations) {
      console.log(`FAIL ${result.sha} :: ${result.subject} :: ${violation}`);
    }
  }

  if (failingCommits > 0) {
    process.exitCode = 1;
    console.error(
      `Branch audit failed: ${failingCommits} of ${commits.length} commits violate policy in ${range}.`,
    );
    return;
  }

  console.log(`Branch audit passed: ${commits.length} commits checked in ${range}.`);
}

main().catch((error) => {
  const reason = error instanceof Error ? error.message : String(error);
  fail(`Unexpected error while auditing branch history: ${reason}`);
});
