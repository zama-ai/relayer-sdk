const { setupGlobalJestFhevmConfig } = require('./setupJestBase.cjs');
const { setTFHE, setTKMS } = require('./src/sdk/lowlevel/wasm-modules');

// Initialize WASM modules
setTFHE(require('node-tfhe'));
setTKMS(require('node-tkms'));

setupGlobalJestFhevmConfig('mainnet', '.env.mainnet');
