const { setupGlobalJestFhevmConfig } = require('./setupJestBase.cjs');

const fetchMock = require('fetch-mock');

global.fetch = fetchMock.default.fetchHandler;
global.TFHE = require('node-tfhe');
global.TKMS = require('node-tkms');

setupGlobalJestFhevmConfig('fetch-mock');
