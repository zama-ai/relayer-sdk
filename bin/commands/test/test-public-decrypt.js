'use strict';

import { logCLI, parseCommonOptions } from '../../utils.js';
import { FHETestAddresses } from './fheTest.js';
import { ethers } from 'ethers';
import { publicDecrypt } from '../../publicDecrypt.js';
import { safeJSONstringify } from '../../../lib/internal.js';

// Testnet public handles:
// =======================
// 0xf1673094de7c833604f1b62183cbcdf2cdc968db90ff0000000000aa36a70400 euint32 1083783185
// 0x9797f8eb707b0a32c47a80ea86c0648df36bfe7cd0ff0000000000aa36a70300 euint16 15764
// 0x6f17228bda73a5e57b94511c5bab2665e6a2870399ff0000000000aa36a70200 euint8 171
// 0x821c6ef4218b335278214b00b1ad41757c7bc644ffff0000000000aa36a70500 euint64 12168711736151452489
// 0x9d430a3e950560ba22013ce885d6d90f0da36efdf1ff0000000000aa36a70600 euint128 308429577281045301472547520724787086512
// 0xf6751d547a5c06123575aad93f22f76b7d841c4cacff0000000000aa36a70000 ebool false
//
// npx . test public-decrypt --types euint32 --network testnet --version 1
// npx . test public-decrypt --types euint32 --network testnet --version 2
// npx . test public-decrypt --types euint32 --network mainnet --version 2
export async function testFHETestPublicDecryptCommand(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

  logCLI('🚚 network: ' + config.name, options);
  logCLI(`🍔 signer: ${signer.address}`);

  if (!FHETestAddresses[config.name]) {
    logCLI(`❌ FHETest is not deployed on network ${config.name}`, options);
    process.exit(1);
  }

  const contractAddress = FHETestAddresses[config.name];

  const abi = [];
  const getFuncNames = [];

  // Turn 'euint32' into 'Euint32'
  for (let i = 0; i < options.types.length; ++i) {
    const t = 'E' + options.types[i].substring(1);
    const getFuncName = `get${t}`;
    getFuncNames.push(getFuncName);
    abi.push(`function ${getFuncName}() view returns (bytes32)`);
  }

  const contract = new ethers.Contract(contractAddress, abi, signer);

  const handles = [];
  for (let i = 0; i < getFuncNames.length; ++i) {
    const handle = await contract[getFuncNames[i]]();
    handles.push(handle);
    logCLI(`🏈 handle: ${handle}`);
  }

  const res = await publicDecrypt(handles, config, zamaFhevmApiKey, options);

  console.log(safeJSONstringify(res, 2));
}
