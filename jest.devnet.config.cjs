const baseConfig = require('./jest.base.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      ...baseConfig,
      displayName: 'sequential',
      setupFiles: ['./setupJestDevnet.cjs'],
      testMatch: [
        '**/RelayerV2Provider_user-decrypt.test.ts',
        '**/RelayerV2Provider_public-decrypt.test.ts',
        '**/RelayerV2Provider_input-proof.test.ts',
      ],
      testRegex: undefined, // Override base config to avoid conflict with testMatch
      // Force sequential execution for these tests
      maxWorkers: 1,
    },
    {
      ...baseConfig,
      displayName: 'parallel',
      setupFiles: ['./setupJestDevnet.cjs'],
      testRegex: '\\.test\\.ts$',
      testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        'RelayerV2Provider_user-decrypt.test.ts',
        'RelayerV2Provider_public-decrypt.test.ts',
        'RelayerV2Provider_input-proof.test.ts',
      ],
    },
  ],
};
