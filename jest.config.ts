import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.ts and .env files
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',

  // Setup files run after the test framework is installed
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Module path aliases matching tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^bson$': '<rootDir>/node_modules/bson/lib/bson.cjs',
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Collect coverage from application code only
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/types/**',
  ],

  // Modules that should not be transformed
  transformIgnorePatterns: ['/node_modules/(?!(.*\\.mjs$))'],
};

export default createJestConfig(config);
