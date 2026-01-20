'use strict';

import { logCLI, parseCommonOptions } from '../../utils.js';
import { FHETestAddresses } from './fheTest.js';
import { ethers } from 'ethers';

// npx . test get --type euint32 --network testnet --json
// npx . test get --type euint32 --network mainnet --json
export async function testFHETestGetCommand(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

  if (!FHETestAddresses[config.name]) {
    logCLI(`❌ FHETest is not deployed on network ${config.name}`, options);
    process.exit(1);
  }

  const contractAddress = FHETestAddresses[config.name];

  const t = 'E' + options.type.substring(1);
  const funcName = `get${t}`;

  const contract = new ethers.Contract(
    contractAddress,
    [`function ${funcName}() view returns (bytes32)`],
    signer,
  );

  const handle = await contract[funcName]();

  const res = {
    network: config.name,
    chainId: config.fhevmInstanceConfig.chainId,
    contractAddress,
    caller: signer.address,
    type: options.type,
    handle,
  };

  console.log(JSON.stringify(res, null, 2));
}
