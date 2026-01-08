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
    ...(options.verbose === true ? { debug: true } : {}),
    auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey },
  };

  const timeout =
    options.timeout !== undefined ? Number(options.timeout) : undefined;

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
        //signal: abortController.signal,
        onProgress: (args) => {
          logCLI(
            `[${args.type}] progress: ${args.step}/${args.totalSteps}`,
            options,
          );
        },
        auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey },
      },
    );

    console.log(safeJSONstringify(res, 2));

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
