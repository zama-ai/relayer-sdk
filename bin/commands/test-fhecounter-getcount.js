'use strict';

import {
  isFheTypeName,
  encryptionBitsFromFheTypeName,
  FhevmHandle,
  bytesToHex,
} from '../../lib/internal.js';
import { getInstance } from '../instance.js';
import { loadFhevmPubKey } from '../pubkeyCache.js';
import { logCLI, parseCommonOptions, throwError } from '../utils.js';
import { ethers } from 'ethers';

// npx . test fhecounter-get-count
export async function testFheCounterGetCountCommand(options) {
  const { config, provider } = parseCommonOptions(options);

  const contractAddress =
    config.name === 'testnet'
      ? '0x69c4511f85E9acBb9a3D4Be7098d1d2232Ed1F7f'
      : '0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9';
  // Devnet
  // const FHE_COUNTER_PUBLIC_DECRYPT_ADDRESS =
  //   '0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9';
  // const FHE_COUNTER_USER_DECRYPT_ADDRESS =
  //   '0xE4DdA6c4C007e24fcebF95073d8Cd7b2a3db1A40';
  // const FHE_COUNTER_DEPLOYER_ADDRESS =
  //   '0x37AC010c1c566696326813b840319B58Bb5840E4';

  // Testnet
  // FHE_COUNTER_USER_DECRYPT_ADDRESS=0x9F3fd46B454D35cc4c661a97FB5e6FaBb70A18C2
  // const FHE_COUNTER_PUBLIC_DECRYPT_ADDRESS =
  //   '0x69c4511f85E9acBb9a3D4Be7098d1d2232Ed1F7f';
  // FHE_COUNTER_DEPLOYER_ADDRESS=0x37AC010c1c566696326813b840319B58Bb5840E4
  // handle(testnet): 0x8f0e50f96fa55c3d7e4abe9db89ff72c0fb4f58c6a000000000000aa36a70400
  const contract = new ethers.Contract(
    contractAddress,
    ['function getCount() view returns (bytes32)'],
    provider,
  );

  const eCount = await contract.getCount();
  const handle = FhevmHandle.fromBytes32Hex(eCount);

  logCLI('🚚 network: ' + config.name, options);
  logCLI('🤖 contractAddress: ' + contractAddress, options);

  console.log(JSON.stringify(handle, null, 2));
}
