import { safeJSONstringify } from '../lib/internal.js';
import { getInstance } from './instance.js';
import { loadFhevmPublicKeyConfig } from './pubkeyCache.js';
import { logCLI } from './utils.js';

export async function userDecrypt({
  handleContractPairs,
  contractAddresses,
  signer,
  config,
  zamaFhevmApiKey,
  options,
}) {
  const { publicKey, publicParams } = await loadFhevmPublicKeyConfig(
    config,
    options,
  );

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

    logCLI('Generating key pair...', options);

    const keypair = instance.generateKeypair();

    logCLI(`privateKey hex length:${keypair.privateKey.length}`);
    logCLI(`publicKey hex length:${keypair.publicKey.length}`);

    logCLI('Running user decrypt...', options);

    const startTimeStamp = Math.floor(Date.now() / 1000);
    const durationDays = 1;

    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays,
    );

    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification:
          eip712.types.UserDecryptRequestVerification,
      },
      eip712.message,
    );

    const res = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature,
      contractAddresses,
      signer.address,
      startTimeStamp,
      durationDays,
      {
        timeout,
        fetchRetries,
        fetchRetryDelayInMilliseconds,
        //signal: abortController.signal,
        onProgress: (args) => {
          let s = `[${config.name}/v${config.version}/user-decrypt - ${args.type}] jobId:${args.jobId} requestId:${args.requestId} retryCount:${args.retryCount}`;
          if (args.retryAfterMs !== undefined) {
            s += ` retryAfterMs:${args.retryAfterMs}`;
          }
          logCLI(s, options);
        },
        auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey },
      },
    );

    console.log(safeJSONstringify(res, 2));

    return res;
  } catch (e) {
    logError('User Decrypt', e, options);
    process.exit(1);
  }
}
