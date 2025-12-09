/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      [
        // Capas FSD
        'app',
        'widgets',
        'features',
        'entities',
        'shared',
        // Features
        'create-task',
        'delete-task',
        'edit-task',
        'filter-tasks',
        'reorder-tasks',
        'toggle-task',
        'toggle-theme',
        // Entities
        'task',
        // Shared
        'api',
        'hooks',
        'ui',
        'lib',
        'config',
        // Otros
        'tests',
        'deps',
        'ci',
      ],
    ],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
};
