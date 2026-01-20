'use strict';

import { InputVerifier, KMSVerifier } from '../../lib/internal.js';
import { parseCommonOptions } from '../utils.js';

// npx . config
// npx . config --network testnet
// npx . config --network devnet
// npx . config --network mainnet
// npx . config --contract-address 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9 --user-address 0x37AC010c1c566696326813b840319B58Bb5840E4
export async function configCommand(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

  const iv = await InputVerifier.loadFromChain({
    inputVerifierContractAddress:
      config.fhevmInstanceConfig.inputVerifierContractAddress,
    provider,
  });

  const kv = await KMSVerifier.loadFromChain({
    kmsContractAddress: config.fhevmInstanceConfig.kmsContractAddress,
    provider,
  });

  console.log(
    JSON.stringify(
      {
        ...config,
        coprocessorSigners: iv.coprocessorSigners,
        coprocessorSignerThreshold: iv.coprocessorSignerThreshold,
        kmsSigners: kv.kmsSigners,
        kmsSignerThreshold: kv.kmsSignerThreshold,
      },
      null,
      2,
    ),
  );
}
