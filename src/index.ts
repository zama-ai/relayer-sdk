import { isAddress } from 'ethers';
import {
  type FhevmInstanceConfig,
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

import type { HandleContractPair } from './relayer/userDecrypt';
import { userDecryptRequest } from './relayer/userDecrypt';
import { createRelayerEncryptedInput } from './relayer/sendEncryption';
import type { RelayerEncryptedInput } from './relayer/sendEncryption';
import { publicDecryptRequest } from './relayer/publicDecrypt';

import type { PublicParams } from './sdk/encrypt';

import { generateKeypair, createEIP712 } from './sdk/keypair';
import type { EIP712, EIP712Type } from './sdk/keypair';
import type { Auth, BearerToken, ApiKeyCookie, ApiKeyHeader } from './auth';

import fetchRetry from 'fetch-retry';
import type {
  PublicDecryptResults,
  UserDecryptResults,
  ClearValueType,
  ClearValues,
} from './relayer/decryptUtils';

global.fetch = fetchRetry(global.fetch, { retries: 5, retryDelay: 500 });

export { generateKeypair, createEIP712 };
export type {
  EIP712,
  EIP712Type,
  Auth,
  BearerToken,
  ApiKeyCookie,
  ApiKeyHeader,
  RelayerEncryptedInput,
  HandleContractPair,
  PublicParams,
};
export { ENCRYPTION_TYPES } from './sdk/encryptionTypes';
export type { EncryptionBits } from './sdk/encryptionTypes';
export { getErrorCauseStatus, getErrorCauseCode } from './relayer/error';
export type {
  PublicDecryptResults,
  UserDecryptResults,
  ClearValueType,
  ClearValues,
};

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
  ) => Promise<PublicDecryptResults>;
  userDecrypt: (
    handles: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: string | number,
    durationDays: string | number,
  ) => Promise<UserDecryptResults>;
  getPublicKey: () => { publicKeyId: string; publicKey: Uint8Array } | null;
  getPublicParams: (bits: keyof PublicParams) => {
    publicParams: Uint8Array;
    publicParamsId: string;
  } | null;
};

export const SepoliaConfig: FhevmInstanceConfig = {
  // ACL_CONTRACT_ADDRESS (FHEVM Host chain)
  aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
  // KMS_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
  kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
  // INPUT_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
  inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
  // DECRYPTION_ADDRESS (Gateway chain)
  verifyingContractAddressDecryption:
    '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
  // INPUT_VERIFICATION_ADDRESS (Gateway chain)
  verifyingContractAddressInputVerification:
    '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
  // FHEVM Host chain id
  chainId: 11155111,
  // Gateway chain id
  gatewayChainId: 10901,
  // Optional RPC provider to host chain
  network: 'https://ethereum-sepolia-rpc.publicnode.com',
  // Relayer URL
  relayerUrl: 'https://relayer.testnet.zama.org',
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
    auth,
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
    createEIP712: createEIP712(verifyingContractAddressDecryption, chainId),
    publicDecrypt: publicDecryptRequest(
      kmsSigners,
      thresholdKMSSigners,
      gatewayChainId,
      verifyingContractAddressDecryption,
      aclContractAddress,
      cleanURL(config.relayerUrl),
      provider,
      auth && { auth },
    ),
    userDecrypt: userDecryptRequest(
      kmsSigners,
      gatewayChainId,
      chainId,
      verifyingContractAddressDecryption,
      aclContractAddress,
      cleanURL(config.relayerUrl),
      provider,
      auth && { auth },
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
