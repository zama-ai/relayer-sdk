const { setupGlobalJestFhevmConfig } = require('./setupJestBase.cjs');
const { setTFHE, setTKMS } = require('./src/sdk/lowlevel/wasm-modules');

const fetchMock = require('fetch-mock');

global.fetch = fetchMock.default.fetchHandler;

// Initialize WASM modules
setTFHE(require('node-tfhe'));
setTKMS(require('node-tkms'));

setupGlobalJestFhevmConfig('fetch-mock');
