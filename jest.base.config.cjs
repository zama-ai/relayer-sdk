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
    '^@relayer-provider/(.*)$': '<rootDir>/src/relayer-provider/$1',
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
  transformIgnorePatterns: ['/node_modules/'],
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
