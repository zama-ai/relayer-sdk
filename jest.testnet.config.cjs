const baseConfig = require('./jest.base.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,

  setupFiles: ['./setupJestTestnet.cjs'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
    },
  },
};
