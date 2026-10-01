// Canonical commitlint configuration. Keep any rule changes in this file only.
const allowedScopes = [
  'home',
  'projects',
  'project-detail',
  'create-task',
  'edit-task',
  'create-project',
  'edit-project',
  'toggle-theme',
  'app',
  'api',
  'hooks',
  'lib',
  'ui',
  'config',
  'widgets',
  'readme',
  'tests',
  'deps',
  'ci',
  'arch',
];

const allowedTypes = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
];

module.exports = {
  rules: {
    'header-max-length': [2, 'always', 100],
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', allowedScopes],
    'subject-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always', allowedTypes],
  },
};
