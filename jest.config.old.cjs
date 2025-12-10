module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
    '^.+\\.js$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
    '^.+\\.bin$': ['<rootDir>config/rawLoader.cjs'],
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/kms/*',
    '!src/init.ts',
    '!src/node.ts',
    '!src/web.ts',
  ],
  setupFiles: ['./setupJest.cjs'],
  testRegex: '\\.test\\.ts$',
  coverageReporters: ['lcov', 'text-summary', 'json'],
  transformIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 59,
      lines: 60,
    },
  },
};
