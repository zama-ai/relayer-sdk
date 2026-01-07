'use strict';

import { ACL } from '../../../lib/internal.js';
import { logCLI, parseCommonOptions } from '../../utils.js';
import { FHETestAddresses } from './fheTest.js';
import { ethers } from 'ethers';

// npx . test make-publicly-decryptable --type euint32 --network devnet
// npx . test make-publicly-decryptable --type euint32 --network testnet
// npx . test make-publicly-decryptable --type euint32 --network mainnet
export async function testFHETestMakePubliclyDecryptableCommand(options) {
  const { config, provider, signer } = parseCommonOptions(options);

  logCLI('🚚 network: ' + config.name, options);
  logCLI(`🍔 signer: ${signer.address}`);

  if (!FHETestAddresses[config.name]) {
    logCLI(`❌ FHETest is not deployed on network ${config.name}`, options);
    process.exit(1);
  }

  const contractAddress = FHETestAddresses[config.name];

  // Turn 'euint32' into 'Euint32'
  const t = 'E' + options.type.substring(1);
  const funcName = `makePubliclyDecryptable${t}`;
  const getFuncName = `get${t}`;

  const contract = new ethers.Contract(
    contractAddress,
    [
      `function ${funcName}() external`,
      `function ${getFuncName}() view returns (bytes32)`,
    ],
    signer,
  );

  const handle = await contract[getFuncName]();
  logCLI(`🏈 handle: ${handle}`);

  const acl = new ACL({
    aclContractAddress: config.fhevmInstanceConfig.aclContractAddress,
    provider,
  });
  const ok = await acl.isAllowedForDecryption([handle]);
  if (ok[0] === true) {
    logCLI(`🚨 handle is already publicly decryptable.`);
    return;
  }

  /** @type {import('ethers').ContractTransactionResponse} */
  const tx = await contract[funcName]();

  logCLI(`🚚 tx: ${tx.hash} ...`);

  /** @type {import('ethers').ContractTransactionReceipt} */
  const txReceipt = await tx.wait();

  logCLI(`- tx status: ${txReceipt.status}`);
  logCLI(`- tx gas used: ${txReceipt.gasUsed}`);
  logCLI(`- tx gas price: ${txReceipt.gasPrice}`);
}
