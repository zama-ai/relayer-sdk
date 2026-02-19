import { bytesToHex, FhevmHandle } from '../lib/internal.js';
import { getInstance } from './instance.js';
import { logCLI, fheTypedValuesToBuilderFunctionWithArg } from './utils.js';

export async function inputProof({
  fheTypedValues,
  config,
  publicKey,
  publicParams,
  zamaFhevmApiKey,
  options,
}) {
  const arr = fheTypedValuesToBuilderFunctionWithArg(fheTypedValues);

  const instanceOptions = {
    ...(options.debug === true ? { debug: true } : {}),
    auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey },
  };

  const timeout =
    options.timeout !== undefined ? Number(options.timeout) : undefined;
  const fetchRetries =
    options.fetchRetries !== undefined
      ? Number(options.fetchRetries)
      : undefined;
  const fetchRetryDelayInMilliseconds =
    options.fetchRetryDelay !== undefined
      ? Number(options.fetchRetryDelay)
      : undefined;

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
        timeout,
        fetchRetries,
        fetchRetryDelayInMilliseconds,
        onProgress: (args) => {
          let s = `[${config.name}/v${config.version}/input-proof - ${args.type}] jobId:${args.jobId} requestId:${args.requestId} retryCount:${args.retryCount}`;
          if (args.retryAfterMs !== undefined) {
            s += ` retryAfterMs:${args.retryAfterMs}`;
          }
          logCLI(s, options);
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
    logError('Input Proof', e, options);
    process.exit(1);
  }
}
