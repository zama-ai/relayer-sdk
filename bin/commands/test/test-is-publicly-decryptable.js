'use strict';

import { ACL } from '../../../lib/internal.js';
import { logCLI, parseCommonOptions } from '../../utils.js';
import { FHETestAddresses } from './fheTest.js';
import { ethers } from 'ethers';

// npx . test is-publicly-decryptable --type euint32 --network devnet
// npx . test is-publicly-decryptable --type euint32 --network testnet
// npx . test is-publicly-decryptable --type euint32 --network mainnet
export async function testFHETestIsPubliclyDecryptableCommand(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

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

  console.log(ok[0]);
}
