import { isAddress, Eip1193Provider } from 'ethers';
import {
  FhevmInstanceConfig,
  getChainId,
  getKMSSigners,
  getKMSSignersThreshold,
  getCoprocessorSigners,
  getCoprocessorSignersThreshold,
  getProvider,
  getPublicParams,
  getTfheCompactPublicKey,
  getFhevmInstanceConfigFromRelayer,
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
import { DecryptedResults } from './relayer/decryptUtils';

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
export { EncryptionTypes, ENCRYPTION_TYPES } from './sdk/encryptionTypes';
export { DecryptedResults } from './relayer/decryptUtils';

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
  publicDecrypt: (
    handles: (string | Uint8Array)[],
  ) => Promise<DecryptedResults>;
  userDecrypt: (
    handles: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: string | number,
    durationDays: string | number,
  ) => Promise<DecryptedResults>;
  getPublicKey: () => { publicKeyId: string; publicKey: Uint8Array } | null;
  getPublicParams: (bits: keyof PublicParams) => {
    publicParams: Uint8Array;
    publicParamsId: string;
  } | null;
};

export const createInstanceFromRelayer = async (
  url: string,
  fhevm_chain_id: number,
  public_key_id?: string | null,
  network?: Eip1193Provider | string,
) => {
  return createInstance(
    await getFhevmInstanceConfigFromRelayer(
      url,
      fhevm_chain_id,
      public_key_id,
      network,
    ),
  );
};

export const createInstance = async (
  config: FhevmInstanceConfig,
): Promise<FhevmInstance> => {
  const {
    verifyingContractAddressDecryption,
    verifyingContractAddressInputVerification,
    publicKey,
    kmsContractAddress,
    aclContractAddress,
    gatewayChainId,
  } = config;

  if (!kmsContractAddress || !isAddress(kmsContractAddress)) {
    throw new Error('KMS contract address is not valid or empty');
  }

  if (
    !verifyingContractAddressDecryption ||
    !isAddress(verifyingContractAddressDecryption)
  ) {
    throw new Error(
      'Verifying contract for Decryption address is not valid or empty',
    );
  }

  if (
    !verifyingContractAddressInputVerification ||
    !isAddress(verifyingContractAddressInputVerification)
  ) {
    throw new Error(
      'Verifying contract for InputVerification address is not valid or empty',
    );
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

  const thresholdKMSSigners = await getKMSSignersThreshold(provider, config);

  const coprocessorSigners = await getCoprocessorSigners(provider, config);

  const thresholdCoprocessorSigners = await getCoprocessorSignersThreshold(
    provider,
    config,
  );

  return {
    createEncryptedInput: createRelayerEncryptedInput(
      aclContractAddress,
      verifyingContractAddressInputVerification,
      chainId,
      gatewayChainId,
      cleanURL(config.relayerUrl),
      publicKeyData.publicKey,
      publicParamsData,
      coprocessorSigners,
      thresholdCoprocessorSigners,
    ),
    generateKeypair,
    createEIP712: createEIP712(
      gatewayChainId,
      verifyingContractAddressDecryption,
      chainId,
    ),
    publicDecrypt: publicDecryptRequest(
      kmsSigners,
      thresholdKMSSigners,
      gatewayChainId,
      verifyingContractAddressDecryption,
      aclContractAddress,
      cleanURL(config.relayerUrl),
      provider,
    ),
    userDecrypt: userDecryptRequest(
      kmsSigners,
      gatewayChainId,
      chainId,
      verifyingContractAddressDecryption,
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
