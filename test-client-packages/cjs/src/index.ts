const { createInstance, SepoliaConfig } =
  require('@zama-fhe/relayer-sdk/node') as typeof import('@zama-fhe/relayer-sdk/node');
const { ethers } = require('ethers') as typeof import('ethers');

import type {
  FhevmInstance,
  RelayerEncryptedInput,
  RelayerInputProofProgressArgs,
} from '@zama-fhe/relayer-sdk/node';

async function test(relayerUrl: string) {
  const contractAddress = '0x1E7eA8fE4877E6ea5dc8856f0dA92da8d5066241';
  const userAddress = '0x37AC010c1c566696326813b840319B58Bb5840E4';

  const instance: FhevmInstance = await createInstance({
    ...SepoliaConfig,
    relayerUrl,
  });

  const input: RelayerEncryptedInput = instance.createEncryptedInput(
    contractAddress,
    userAddress,
  );
  input.add64(123);

  const enc = await input.encrypt({
    onProgress: (args: RelayerInputProofProgressArgs) => {
      console.log(args.type);
    },
  });

  console.log(ethers.hexlify(enc.handles[0]));
}

async function main() {
  await test(`${SepoliaConfig.relayerUrl}/v1`);
  await test(`${SepoliaConfig.relayerUrl}/v2`);
}

main();
