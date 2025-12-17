const { setupGlobalJestFhevmConfig } = require('./setupJestBase.cjs');

global.TFHE = require('node-tfhe');
global.TKMS = require('node-tkms');
setupGlobalJestFhevmConfig('devnet', '.env.devnet');
