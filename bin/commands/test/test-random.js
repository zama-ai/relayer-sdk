'use strict';

import { logCLI, parseCommonOptions } from '../../utils.js';
import { FHETestAddresses } from './fheTest.js';
import { ethers } from 'ethers';

// npx . test random --type euint32 --network testnet
// npx . test random --type euint32 --network devnet
export async function testFHETestRandomCommand(options) {
  const { config, provider, signer } = parseCommonOptions(options);

  if (options.type === 'eaddress') {
    logCLI(`❌ FHETest does not support random addresses`, options);
    process.exit(1);
  }

  logCLI('🚚 network: ' + config.name, options);
  logCLI(`🍔 signer: ${signer.address}`);

  if (!FHETestAddresses[config.name]) {
    logCLI(`❌ FHETest is not deployed on network ${config.name}`, options);
    process.exit(1);
  }

  const contractAddress = FHETestAddresses[config.name];

  // Turn 'euint32' into 'Euint32'
  const t = 'E' + options.type.substring(1);
  const funcName = `rand${t}`;
  const getFuncName = `get${t}`;

  const contract = new ethers.Contract(
    contractAddress,
    [
      `function ${funcName}() external`,
      `function ${getFuncName}() view returns (bytes32)`,
    ],
    signer,
  );

  /** @type {import('ethers').ContractTransactionResponse} */
  const tx = await contract[funcName]();

  logCLI(`🚚 tx: ${tx.hash} ...`);

  /** @type {import('ethers').ContractTransactionReceipt} */
  const txReceipt = await tx.wait();

  logCLI(`- tx status: ${txReceipt.status}`);
  logCLI(`- tx gas used: ${txReceipt.gasUsed}`);
  logCLI(`- tx gas price: ${txReceipt.gasPrice}`);

  const handle = await contract[getFuncName]();
  logCLI(`🏈 new handle: ${handle}`);
}
