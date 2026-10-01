#!/usr/bin/env node

const { execFile } = require('node:child_process');
const { readFile } = require('node:fs/promises');
const process = require('node:process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const MAX_CHANGED_LINES = 100;
const EXCEPTION_TRAILER = 'Commit-Exception:';
const TRAILER_LINE_PATTERN = /^[A-Za-z][A-Za-z0-9-]*:\s*.*$/u;

function fail(message) {
  console.error(message);
  process.exit(1);
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

async function getStagedLineStats() {
  let stdout;

  try {
    ({ stdout } = await execFileAsync('git', ['diff', '--cached', '--numstat']));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    fail(`Unable to inspect the staged diff: ${reason}`);
  }

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

async function main() {
  const messageFilePath = process.argv[2];

  if (!messageFilePath) {
    fail(
      'Missing commit message file path.\nUsage: node scripts/commit/check-commit-size.cjs <commit-message-file>',
    );
  }

  let commitMessage;

  try {
    commitMessage = await readFile(messageFilePath, 'utf8');
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    fail(`Unable to read commit message file "${messageFilePath}": ${reason}`);
  }

  const { added, deleted, total } = await getStagedLineStats();

  if (total <= MAX_CHANGED_LINES) {
    return;
  }

  const exception = getCommitException(commitMessage);

  if (exception) {
    return;
  }

  fail(
    [
      `Commit blocked: staged diff is ${total} changed lines (${added} added, ${deleted} deleted).`,
      `Limit: ${MAX_CHANGED_LINES} changed lines.`,
      `To allow this commit, add a non-empty "${EXCEPTION_TRAILER}" footer with a clear justification.`,
    ].join('\n'),
  );
}

main().catch((error) => {
  const reason = error instanceof Error ? error.message : String(error);
  fail(`Unexpected error while checking commit size: ${reason}`);
});
