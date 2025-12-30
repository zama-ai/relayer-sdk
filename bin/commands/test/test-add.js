'use strict';

import { safeJSONstringify } from '../../../lib/internal.js';
import { inputProof } from '../../inputProof.js';
import { loadFhevmPublicKeyConfig } from '../../pubkeyCache.js';
import { userDecrypt } from '../../userDecrypt.js';
import { logCLI, parseCommonOptions } from '../../utils.js';
import { FHETestAddresses } from './fheTest.js';
import { ethers } from 'ethers';

// npx . test add --type euint32 --value 123 --network testnet
export async function testFHETestAddCommand(options) {
  const { config, provider, signer } = parseCommonOptions(options);

  logCLI('🚚 network: ' + config.name, options);
  logCLI(`🍔 signer: ${signer.address}`);
  logCLI(`🧀 value: ${BigInt(options.value)}`);
  logCLI(`🍉 type: ${options.type}`);

  const fheTypedValues = [
    {
      value: BigInt(options.value),
      fheType: options.type,
    },
  ];

  if (!FHETestAddresses[config.name]) {
    logCLI(`❌ FHETest is not deployed on network ${config.name}`, options);
    process.exit(1);
  }

  const contractAddress = FHETestAddresses[config.name];

  // Turn 'euint32' into 'Euint32'
  const t = 'E' + options.type.substring(1);
  const addFuncName = `add${t}`;
  const getFuncName = `get${t}`;

  const { publicKey, publicParams } = await loadFhevmPublicKeyConfig(
    config,
    options,
  );

  const o = await inputProof(
    fheTypedValues,
    config,
    publicKey,
    publicParams,
    options,
  );
  console.log(safeJSONstringify(o, 2));

  const contract = new ethers.Contract(
    contractAddress,
    [
      `function ${addFuncName}(bytes32,bytes) external`,
      `function ${getFuncName}() view returns (bytes32)`,
    ],
    signer,
  );

  const handle = await contract[getFuncName]();
  logCLI(`🏈 handle: ${handle}`);

  logCLI(`💥 FHE.add(${handle}, ${o.handles[0]}) ...`);

  /** @type {import('ethers').ContractTransactionResponse} */
  const tx = await contract[addFuncName](o.handles[0], o.inputProof);

  logCLI(`🛺 tx: ${tx.hash} ...`);

  /** @type {import('ethers').ContractTransactionReceipt} */
  const txReceipt = await tx.wait();

  logCLI(`- tx status: ${txReceipt.status}`);
  logCLI(`- tx gas used: ${txReceipt.gasUsed}`);
  logCLI(`- tx gas price: ${txReceipt.gasPrice}`);

  const newHandle = await contract[getFuncName]();
  logCLI(`🏈 new handle: ${newHandle}`);

  await userDecrypt({
    handleContractPairs: [{ handle: newHandle, contractAddress }],
    contractAddresses: [contractAddress],
    signer,
    config,
    options,
  });
}
