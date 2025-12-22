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

function parseValues(values) {
  return values.map((str) => {
    const [value, fheTypeName] = str.split(':');
    if (!isFheTypeName(fheTypeName)) {
      throwError(`Invalid FheType name: ${fheTypeName}`);
    }
    let funcName;
    let arg;
    if (fheTypeName === 'ebool') {
      funcName = 'addBool';
      arg = value === 'true' ? true : false;
    } else if (fheTypeName === 'eaddress') {
      funcName = 'addAddress';
      arg = value;
    } else {
      const bits = encryptionBitsFromFheTypeName(fheTypeName);
      funcName = `add${bits}`;
      arg = BigInt(value);
    }
    return { funcName, arg };
  });
}

// npx . input-proof --values 123:euint32
// npx . input-proof --contract-address 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9 --user-address 0x37AC010c1c566696326813b840319B58Bb5840E4 --values 123:euint32
export async function inputProofCommand(options) {
  const { config } = parseCommonOptions(options);

  const arr = parseValues(options.values);

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
          logCLI('hello!', options);
        },
      },
    );

    // const { handles, inputProof } = await builder.encrypt({
    //   onProgress: (args) => {
    //     console.log('hello!');
    //   },
    // });

    const o = {
      handles: handles.map((h) => FhevmHandle.fromBytes32(h).toBytes32Hex()),
      inputProof: bytesToHex(inputProof),
    };

    console.log(JSON.stringify(o, null, 2));
  } catch (e) {
    console.log(e.message);
    console.log(e);
    console.log(JSON.stringify(e.cause, null, 2));

    process.exit(1);
  }
}
