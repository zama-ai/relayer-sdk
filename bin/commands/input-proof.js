'use strict';

import {
  FhevmHandle,
  bytesToHex,
  safeJSONstringify,
} from '../../lib/internal.js';
import { inputProof } from '../inputProof.js';
import { getInstance } from '../instance.js';
import { loadFhevmPublicKeyConfig } from '../pubkeyCache.js';
import {
  fheTypedValuesToBuilderFunctionWithArg,
  logCLI,
  parseCommonOptions,
  valueColumnTypeListToFheTypedValues,
} from '../utils.js';

// npx . input-proof --values 123:euint32 true:ebool 1234567890123456789:euint256 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9:eaddress --version 2
// npx . input-proof --values 123:euint32 true:ebool 1234567890123456789:euint256 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9:eaddress --version 1
// npx . input-proof --contract-address 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9 --user-address 0x37AC010c1c566696326813b840319B58Bb5840E4 --values 123:euint32
export async function inputProofCommand(options) {
  const { config } = parseCommonOptions(options);

  const { publicKey, publicParams } = await loadFhevmPublicKeyConfig(
    config,
    options,
  );

  const fheTypedValues = valueColumnTypeListToFheTypedValues(options.values);
  const o = await inputProof(
    fheTypedValues,
    config,
    publicKey,
    publicParams,
    options,
  );
  console.log(safeJSONstringify(o, 2));
}
