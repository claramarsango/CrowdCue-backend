/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  resolver: 'jest-ts-webcompat-resolver',
  testMatch: ['**/src/**/*.test.ts'],
};
