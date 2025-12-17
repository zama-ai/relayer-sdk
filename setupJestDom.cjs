const fetchMock = require('fetch-mock');

global.fetch = fetchMock.default.fetchHandler;
global.TFHE = require('node-tfhe');
global.TKMS = require('node-tkms');
