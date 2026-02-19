module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
    '^.+\\.js$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
    '^.+\\.bin$': ['<rootDir>config/rawLoader.cjs'],
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@base/(.*)$': '<rootDir>/src/base/$1',
    '^@sdk/(.*)$': '<rootDir>/src/sdk/$1',
    '^@fhevm-ethers/(.*)$': '<rootDir>/src/ethers/$1',
    '^@fhevm-viem/(.*)$': '<rootDir>/src/viem/$1',
    '^@fhevm-base/(.*)$': '<rootDir>/src/fhevm-base/$1',
    '^@relayer/(.*)$': '<rootDir>/src/relayer/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/test/*',
    '!src/**/*.d.ts',
    '!src/kms/*',
    '!src/init.ts',
    '!src/node.ts',
    '!src/web.ts',
  ],
  coverageReporters: ['lcov', 'text-summary', 'json'],
  transformIgnorePatterns: ['/node_modules/(?!@noble/hashes)'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 62,
      lines: 75,
    },
  },
  testRegex: '\\.test\\.ts$',
};
