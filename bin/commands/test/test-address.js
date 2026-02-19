'use strict';

import { logCLI, parseCommonOptions } from '../../utils.js';
import { FHETestAddresses } from './fheTest.js';

// npx . test address
export async function testFHETestAddressCommand(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

  if (!FHETestAddresses[config.name]) {
    logCLI(`❌ FHETest is not deployed on network ${config.name}`, options);
    process.exit(1);
  } else {
    logCLI('✅ FHETest address: ' + FHETestAddresses[config.name], options);
  }
}
