const fetchMock = require('fetch-mock');

global.fetch = fetchMock.default.fetchHandler;
global.TFHE = require('./src/mock/node-tfhe-mock');
global.TKMS = require('./src/mock/node-tkms-mock');
