'use strict';

import { logCLI, parseCommonOptions } from '../../utils.js';
import { FHETestAddresses } from './fheTest.js';
import { ethers } from 'ethers';
import { userDecrypt } from '../../userDecrypt.js';

// npx . test user-decrypt --types euint32 --network devnet --version 2
// npx . test user-decrypt --types euint32 --network testnet --version 1
// npx . test user-decrypt --types euint32 --network testnet --version 2
// npx . test user-decrypt --types euint32 --network mainnet --version 2
export async function testFHETestUserDecryptCommand(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

  if (!FHETestAddresses[config.name]) {
    logCLI(`❌ FHETest is not deployed on network ${config.name}`, options);
    process.exit(1);
  }

  const contractAddress = FHETestAddresses[config.name];

  logCLI(`🏈 FHETest contract address: ${contractAddress}`);

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

  await userDecrypt({
    handleContractPairs: handles.map((h) => {
      return {
        handle: h,
        contractAddress,
      };
    }),
    contractAddresses: [contractAddress],
    signer,
    config,
    zamaFhevmApiKey,
    options,
  });
}
