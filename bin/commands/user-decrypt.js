'use strict';

import { userDecrypt } from '../userDecrypt.js';
import { logCLI, parseCommonOptions, parseHandles } from '../utils.js';

// npx . user-decrypt  --version 2 --handle 0xe85c2a81338b8542a6c0a99a5a794f158f4fb0f6a2ff0000000000aa36a70400  --contract-address 0x1E7eA8fE4877E6ea5dc8856f0dA92da8d5066241 --network testnet
export async function userDecryptCommand(options) {
  const { config, signer, zamaFhevmApiKey } = parseCommonOptions(options);

  logCLI('🚚 network: ' + config.name, options);
  logCLI(`🍔 signer: ${signer.address}`);

  const handle = options.handle;
  const contractAddress = config.contractAddress;

  logCLI(`🎾 handle: ${handle}`);
  logCLI(`🎾 contractAddress: ${contractAddress}`);

  await userDecrypt({
    handleContractPairs: [{ handle, contractAddress }],
    contractAddresses: [contractAddress],
    signer,
    config,
    zamaFhevmApiKey,
    options,
  });
}
