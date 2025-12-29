import { safeJSONstringify } from '../lib/internal.js';
import { getInstance } from './instance.js';
import { loadFhevmPublicKeyConfig } from './pubkeyCache.js';
import { logCLI } from './utils.js';

export async function userDecrypt({
  handleContractPairs,
  contractAddresses,
  signer,
  config,
  options,
}) {
  const { publicKey, publicParams } = await loadFhevmPublicKeyConfig(
    config,
    options,
  );

  const timeout =
    options.timeout !== undefined ? Number(options.timeout) : undefined;

  try {
    const instance = await getInstance(
      {
        ...config.fhevmInstanceConfig,
        publicKey,
        publicParams,
      },
      options,
    );

    logCLI('Generating key pair...', options);

    const keypair = instance.generateKeypair();

    logCLI('Running user decrypt...', options);

    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '1'; // String for consistency

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
          logCLI('progress=' + args.type, options);
        },
      },
    );

    console.log(safeJSONstringify(res, 2));

    /*
const keypair = instance.generateKeypair();
// userDecrypt can take a batch of handles (with their corresponding contract addresses).
// In this example we only pass one handle.
const handleContractPairs = [
  {
    handle: ciphertextHandle,
    contractAddress: contractAddress,
  },
];
const startTimeStamp = Math.floor(Date.now() / 1000).toString();
const durationDays = '10'; // String for consistency
const contractAddresses = [contractAddress];

const eip712 = instance.createEIP712(
  keypair.publicKey,
  contractAddresses,
  startTimeStamp,
  durationDays,
);

const signature = await signer.signTypedData(
  eip712.domain,
  {
    UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
  },
  eip712.message,
);

const result = await instance.userDecrypt(
  handleContractPairs,
  keypair.privateKey,
  keypair.publicKey,
  signature.replace('0x', ''),
  contractAddresses,
  signer.address,
  startTimeStamp,
  durationDays,
);

*/
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
