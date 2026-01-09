import { bytesToHex, FhevmHandle } from '../lib/internal.js';
import { getInstance } from './instance.js';
import { logCLI, fheTypedValuesToBuilderFunctionWithArg } from './utils.js';

export async function inputProof(
  fheTypedValues,
  config,
  publicKey,
  publicParams,
  zamaFhevmApiKey,
  options,
) {
  const arr = fheTypedValuesToBuilderFunctionWithArg(fheTypedValues);

  const instanceOptions = {
    ...(options?.verbose === true ? { debug: true } : {}),
    auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey },
  };

  try {
    const instance = await getInstance(
      {
        ...config.fhevmInstanceConfig,
        publicKey,
        publicParams,
        ...instanceOptions,
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
          logCLI(
            `[${args.type}] progress: ${args.step}/${args.totalSteps}`,
            options,
          );
        },
        auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey },
      },
    );

    const o = {
      values: fheTypedValues,
      handles: handles.map((h) => FhevmHandle.fromBytes32(h).toBytes32Hex()),
      inputProof: bytesToHex(inputProof),
    };
    return o;
  } catch (e) {
    console.log(e.name);
    console.log(e.message);
    console.log(e);
    console.log(JSON.stringify(e.cause, null, 2));

    process.exit(1);
  }
}
