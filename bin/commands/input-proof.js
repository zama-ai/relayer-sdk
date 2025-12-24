'use strict';

import {
  isFheTypeName,
  encryptionBitsFromFheTypeName,
  FhevmHandle,
  bytesToHex,
  safeJSONstringify,
} from '../../lib/internal.js';
import { getInstance } from '../instance.js';
import { loadFhevmPubKey } from '../pubkeyCache.js';
import {
  fheTypedValuesToBuilderFunctionWithArg,
  logCLI,
  parseCommonOptions,
  throwError,
  valueColumnTypeListToFheTypedValues,
} from '../utils.js';

// npx . input-proof --values 123:euint32 true:ebool 1234567890123456789:euint256 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9:eaddress
// npx . input-proof --contract-address 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9 --user-address 0x37AC010c1c566696326813b840319B58Bb5840E4 --values 123:euint32
export async function inputProofCommand(options) {
  const { config } = parseCommonOptions(options);

  const fheTypedValues = valueColumnTypeListToFheTypedValues(options.values);
  const arr = fheTypedValuesToBuilderFunctionWithArg(fheTypedValues);

  const { publicKey, publicParams } = await loadFhevmPubKey(config, options);

  try {
    const instance = await getInstance(
      {
        ...config.fhevmInstanceConfig,
        publicKey,
        publicParams,
      },
      options,
    );

    const builder = instance.createEncryptedInput(
      config.contractAddress,
      config.userAddress,
    );
    for (let i = 0; i < arr.length; ++i) {
      builder[arr[i].funcName](arr[i].arg);
    }

    logCLI(`🎲 generating zkproof...`, options);
    const zkproof = builder.generateZKProof();

    logCLI(`🎲 verifying zkproof...`, options);
    const { handles, inputProof } = await instance.requestZKProofVerification(
      zkproof,
      {
        onProgress: (args) => {
          logCLI(`onProgress: ${args.type}`, options);
        },
      },
    );

    const o = {
      values: fheTypedValues,
      handles: handles.map((h) => FhevmHandle.fromBytes32(h).toBytes32Hex()),
      inputProof: bytesToHex(inputProof),
    };

    console.log(safeJSONstringify(o, 2));
  } catch (e) {
    console.log(e.message);
    console.log(e);
    console.log(JSON.stringify(e.cause, null, 2));

    process.exit(1);
  }
}
