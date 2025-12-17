const baseConfig = require('./jest.base.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,

  setupFiles: ['./setupJestMock.cjs'],
  testRegex: '\\.test-mock\\.ts$',
};
