const fetchMock = require('@fetch-mock/core');

global.fetch = fetchMock.default.fetchHandler;
global.TFHE = require('node-tfhe');
global.TKMS = require('node-tkms');
