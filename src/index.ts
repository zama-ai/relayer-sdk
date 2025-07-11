import { isAddress } from 'ethers';
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

export const SepoliaConfig: FhevmInstanceConfig = {
  // ACL_CONTRACT_ADDRESS (FHEVM Host chain)
  aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
  // KMS_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
  kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  // INPUT_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
  inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
  // DECRYPTION_ADDRESS (Gateway chain)
  verifyingContractAddressDecryption:
    '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
  // INPUT_VERIFICATION_ADDRESS (Gateway chain)
  verifyingContractAddressInputVerification:
    '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
  // FHEVM Host chain id
  chainId: 11155111,
  // Gateway chain id
  gatewayChainId: 55815,
  // Optional RPC provider to host chain
  network: 'https://eth-sepolia.public.blastapi.io',
  // Relayer URL
  relayerUrl: 'https://relayer.testnet.zama.cloud',
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
    apiKey,
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
      apiKey ? { apiKey } : undefined,
    ),
    generateKeypair,
    createEIP712: createEIP712(verifyingContractAddressDecryption, chainId),
    publicDecrypt: publicDecryptRequest(
      kmsSigners,
      thresholdKMSSigners,
      gatewayChainId,
      verifyingContractAddressDecryption,
      aclContractAddress,
      cleanURL(config.relayerUrl),
      provider,
      apiKey ? { apiKey } : undefined,
    ),
    userDecrypt: userDecryptRequest(
      kmsSigners,
      gatewayChainId,
      chainId,
      verifyingContractAddressDecryption,
      aclContractAddress,
      cleanURL(config.relayerUrl),
      provider,
      apiKey ? { apiKey } : undefined,
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
