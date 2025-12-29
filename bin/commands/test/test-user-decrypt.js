'use strict';

import { logCLI, parseCommonOptions } from '../../utils.js';
import { FHETestAddresses } from './fheTest.js';
import { ethers } from 'ethers';
import { userDecrypt } from '../../userDecrypt.js';

// npx . test user-decrypt --type euint32 --network testnet --version 1
// npx . test user-decrypt --type euint32 --network testnet --version 2
export async function testFHETestUserDecryptCommand(options) {
  const { config, provider, signer } = parseCommonOptions(options);

  logCLI('🚚 network: ' + config.name, options);
  logCLI(`🍔 signer: ${signer.address}`);

  if (!FHETestAddresses[config.name]) {
    logCLI(`❌ FHETest is not deployed on network ${config.name}`, options);
    process.exit(1);
  }

  const contractAddress = FHETestAddresses[config.name];

  logCLI(`🏈 FHETest contract address: ${contractAddress}`);

  // Turn 'euint32' into 'Euint32'
  const t = 'E' + options.type.substring(1);
  const getFuncName = `get${t}`;

  const contract = new ethers.Contract(
    contractAddress,
    [`function ${getFuncName}() view returns (bytes32)`],
    signer,
  );

  const handle = await contract[getFuncName]();
  logCLI(`🏈 handle: ${handle}`);

  await userDecrypt({
    handleContractPairs: [{ handle, contractAddress }],
    contractAddresses: [contractAddress],
    signer,
    config,
    options,
  });
}
