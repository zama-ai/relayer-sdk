import { getInstance } from './instance.js';
import { loadFhevmPublicKeyConfig } from './pubkeyCache.js';
import { logCLI } from './utils.js';

export async function publicDecrypt(handles, config, zamaFhevmApiKey, options) {
  const { publicKey, publicParams } = await loadFhevmPublicKeyConfig(
    config,
    zamaFhevmApiKey,
    options,
  );

  const timeout =
    options.timeout !== undefined ? Number(options.timeout) : undefined;

  const instanceOptions = {
    //...(options.verbose === true ? { debug: true } : {}),
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

    logCLI('Running public decrypt...', options);

    // setTimeout(() => {
    //   abortController.abort();
    // }, 3000);

    const res = await instance.publicDecrypt(handles, {
      timeout,
      //signal: abortController.signal,
      onProgress: (args) => {
        logCLI(
          `[${args.type}] progress: ${args.step}/${args.totalSteps}`,
          options,
        );
      },
      ...(zamaFhevmApiKey
        ? { auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey } }
        : {}),
    });

    return res;
  } catch (e) {
    console.log('');
    console.log('===================== ❌ ERROR ❌ ========================');
    console.log(`[Error message]: '${e.message}'`);
    console.log('');
    console.log(`[Error log]:`);
    console.log(e);
    if (e.cause) {
      console.log('[ERROR cause]:');
      console.log(JSON.stringify(e.cause, null, 2));
    }
    console.log('========================================================');
  }
}
