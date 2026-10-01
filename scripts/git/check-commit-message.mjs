#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import process from 'node:process';

const GENERIC_MESSAGES = new Set(['wip', 'tmp', 'temp', 'update', 'misc', 'fix stuff']);
const IGNORED_PREFIXES = ['fixup!', 'squash!', 'merge ', 'revert "'];

function getCommitHeader(message) {
  return (
    message
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith('#')) ?? ''
  );
}

function normalizeMessagePart(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/gu, ' ')
    .replace(/^["'`]+|["'`]+$/gu, '');
}

function getSemanticTarget(header) {
  const separatorIndex = header.indexOf(':');

  if (separatorIndex === -1) {
    return normalizeMessagePart(header);
  }

  return normalizeMessagePart(header.slice(separatorIndex + 1));
}

function isIgnoredHeader(header) {
  const normalizedHeader = normalizeMessagePart(header);
  return IGNORED_PREFIXES.some((prefix) => normalizedHeader.startsWith(prefix));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function main() {
  const messageFilePath = process.argv[2];

  if (!messageFilePath) {
    fail(
      'Missing commit message file path.\nUsage: node scripts/git/check-commit-message.mjs <commit-message-file>',
    );
  }

  let commitMessage;

  try {
    commitMessage = await readFile(messageFilePath, 'utf8');
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    fail(`Unable to read commit message file "${messageFilePath}": ${reason}`);
  }

  const header = getCommitHeader(commitMessage);

  if (!header || isIgnoredHeader(header)) {
    return;
  }

  const semanticTarget = getSemanticTarget(header);

  if (GENERIC_MESSAGES.has(semanticTarget)) {
    fail(
      [
        `Commit message is too generic: "${header}"`,
        `Blocked subject: "${semanticTarget}"`,
        'Describe the change concretely, for example: feat(projects): add sort controls',
      ].join('\n'),
    );
  }
}

await main();
