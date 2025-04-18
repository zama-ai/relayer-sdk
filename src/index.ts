import { isAddress } from 'ethers';
import {
  FhevmInstanceConfig,
  getChainId,
  getKMSSigners,
  getProvider,
  getPublicParams,
  getTfheCompactPublicKey,
} from './config';
import {
  cleanURL,
  SERIALIZED_SIZE_LIMIT_CRS,
  SERIALIZED_SIZE_LIMIT_PK,
} from './utils';

import { HandleContractPair, userDecryptRequest } from './relayer/userDecrypt';
import {
  createRelayerEncryptedInput,
  RelayerEncryptedInput,
} from './relayer/sendEncryption';
import { publicDecryptRequest } from './relayer/publicDecrypt';

import { PublicParams } from './sdk/encrypt';
import { generateKeypair, createEIP712, EIP712 } from './sdk/keypair';

import fetchRetry from 'fetch-retry';

global.fetch = fetchRetry(global.fetch, { retries: 5, retryDelay: 500 });

export {
  generateKeypair,
  createEIP712,
  EIP712,
  EIP712Type,
} from './sdk/keypair';
export { RelayerEncryptedInput } from './relayer/sendEncryption';
export { HandleContractPair } from './relayer/userDecrypt';
export { PublicParams } from './sdk/encrypt';

export type FhevmInstance = {
  createEncryptedInput: (
    contractAddress: string,
    userAddress: string,
  ) => RelayerEncryptedInput;
  generateKeypair: () => { publicKey: string; privateKey: string };
  createEIP712: (
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: string | number,
    durationDays: string | number,
  ) => EIP712;
  publicDecrypt: (handle: string | Uint8Array) => Promise<bigint>;
  userDecrypt: (
    handles: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: string | number,
    durationDays: string | number,
  ) => Promise<bigint[]>;
  getPublicKey: () => { publicKeyId: string; publicKey: Uint8Array } | null;
  getPublicParams: (bits: keyof PublicParams) => {
    publicParams: Uint8Array;
    publicParamsId: string;
  } | null;
};

export const createInstance = async (
  config: FhevmInstanceConfig,
): Promise<FhevmInstance> => {
  const {
    publicKey,
    kmsContractAddress,
    verifyingContractAddress,
    aclContractAddress,
    gatewayChainId,
  } = config;

  if (!kmsContractAddress || !isAddress(kmsContractAddress)) {
    throw new Error('KMS contract address is not valid or empty');
  }

  if (!verifyingContractAddress || !isAddress(verifyingContractAddress)) {
    throw new Error('Verifying contract address is not valid or empty');
  }

  if (!aclContractAddress || !isAddress(aclContractAddress)) {
    throw new Error('ACL contract address is not valid or empty');
  }

  if (publicKey && !(publicKey.data instanceof Uint8Array))
    throw new Error('publicKey must be a Uint8Array');

  const provider = getProvider(config);

  if (!provider) {
    throw new Error('No network has been provided!');
  }

  const chainId = await getChainId(provider, config);

  const publicKeyData = await getTfheCompactPublicKey(config);

  const publicParamsData = await getPublicParams(config);

  const kmsSigners = await getKMSSigners(provider, config);

  return {
    createEncryptedInput: createRelayerEncryptedInput(
      aclContractAddress,
      chainId,
      cleanURL(config.relayerUrl),
      publicKeyData.publicKey,
      publicParamsData,
    ),
    generateKeypair,
    createEIP712: createEIP712(
      gatewayChainId,
      verifyingContractAddress,
      chainId,
    ),
    publicDecrypt: publicDecryptRequest(
      kmsSigners,
      gatewayChainId,
      chainId,
      verifyingContractAddress,
      aclContractAddress,
      cleanURL(config.relayerUrl),
      provider,
    ),
    userDecrypt: userDecryptRequest(
      kmsSigners,
      gatewayChainId,
      chainId,
      verifyingContractAddress,
      aclContractAddress,
      cleanURL(config.relayerUrl),
      provider,
    ),
    getPublicKey: () =>
      publicKeyData.publicKey
        ? {
            publicKey: publicKeyData.publicKey.safe_serialize(
              SERIALIZED_SIZE_LIMIT_PK,
            ),
            publicKeyId: publicKeyData.publicKeyId,
          }
        : null,
    getPublicParams: (bits: keyof PublicParams) => {
      if (publicParamsData[bits]) {
        return {
          publicParams: publicParamsData[bits]!.publicParams.safe_serialize(
            SERIALIZED_SIZE_LIMIT_CRS,
          ),
          publicParamsId: publicParamsData[bits]!.publicParamsId,
        };
      }
      return null;
    },
  };
};
