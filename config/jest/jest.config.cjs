const path = require('node:path');
const nextJest = require('next/jest');

const rootDir = path.resolve(__dirname, '../..');

const createJestConfig = nextJest({
  dir: rootDir,
});

/** @type {import('jest').Config} */
const config = {
  rootDir,
  setupFilesAfterEnv: ['<rootDir>/config/jest/setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/__tests__/test-utils/',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};

module.exports = createJestConfig(config);
