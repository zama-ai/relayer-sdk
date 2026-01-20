import { getInstance } from './instance.js';
import { loadFhevmPublicKeyConfig } from './pubkeyCache.js';
import { logCLI, logError, sleep } from './utils.js';

export async function publicDecrypt({
  handles,
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

    logCLI('Running public decrypt...', options);

    // setTimeout(() => {
    //   abortController.abort();
    // }, 3000);

    //await sleep(10000);

    const res = await instance.publicDecrypt(handles, {
      timeout,
      fetchRetries,
      fetchRetryDelayInMilliseconds,
      //signal: abortController.signal,
      onProgress: (args) => {
        let s = `[${config.name}/v${config.version}/public-decrypt - ${args.type}] jobId:${args.jobId} requestId:${args.requestId} retryCount:${args.retryCount}`;
        if (args.retryAfterMs !== undefined) {
          s += ` retryAfterMs:${args.retryAfterMs}`;
        }
        logCLI(s, options);
      },
      ...(zamaFhevmApiKey
        ? { auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey } }
        : {}),
    });

    return res;
  } catch (e) {
    logError('Public Decrypt', e, options);
    process.exit(1);
  }
}
