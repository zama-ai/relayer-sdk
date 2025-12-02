const fetchMock = require('@fetch-mock/core');

global.fetch = fetchMock.default.fetchHandler;
global.TFHE = require('./src/mock/node-tfhe-mock');
global.TKMS = require('./src/mock/node-tkms');
