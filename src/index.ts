import type {
  RelayerEncryptedInput,
  RelayerInputProofOptionsType,
  RelayerPublicDecryptOptionsType,
  RelayerUserDecryptOptionsType,
} from './relayer-provider/types/public-api';
import type { Prettify } from './base/types/utils';
import type { EIP712, EIP712Type } from './sdk/keypair';
import type { BytesHex, ZKProofLike } from './base/types/primitives';
import type {
  ClearValues,
  ClearValueType,
  FhevmInstanceConfig,
  FhevmInstanceOptions,
  PublicDecryptResults,
  PublicParams,
  UserDecryptResults,
  HandleContractPair,
  FhevmPkeCrsType,
  FhevmPkeConfigType,
  FhevmPublicKeyType,
  FhevmPkeCrsByCapacityType,
} from './types/relayer';
import { userDecryptRequest } from './relayer/userDecrypt';
import {
  createRelayerEncryptedInput,
  requestCiphertextWithZKProofVerification,
} from './relayer/sendEncryption';
import { publicDecryptRequest } from './relayer/publicDecrypt';
import { createRelayerFhevm } from './relayer-provider/createRelayerFhevm';
import { generateKeypair, createEIP712 } from './sdk/keypair';
import { ZKProof } from './sdk/ZKProof';
import { CoprocessorSignersVerifier } from './sdk/coprocessor/CoprocessorSignersVerifier';

// Disable global use of fetch-retry
// Make sure `workerHelpers.js` behaviour is consistant and tfhe WASM module is
// still running in MT mode
//global.fetch = fetchRetry(global.fetch, { retries: 5, retryDelay: 500 });

export { generateKeypair, createEIP712 };
export { getErrorCauseStatus, getErrorCauseCode } from './relayer/error';
export type { EncryptionBits } from './base/types/primitives';
export type {
  EIP712,
  EIP712Type,
  RelayerEncryptedInput,
  HandleContractPair,
  PublicParams,
};
export type {
  PublicDecryptResults,
  UserDecryptResults,
  ClearValueType,
  ClearValues,
  FhevmInstanceConfig,
  FhevmInstanceOptions,
  ZKProofLike,
  FhevmPkeCrsType,
  FhevmPkeConfigType,
  FhevmPublicKeyType,
  FhevmPkeCrsByCapacityType,
  Prettify,
};

////////////////////////////////////////////////////////////////////////////////
// FhevmInstance
////////////////////////////////////////////////////////////////////////////////

export type FhevmInstance = {
  createEncryptedInput: (
    contractAddress: string,
    userAddress: string,
  ) => RelayerEncryptedInput;
  requestZKProofVerification: (
    zkProof: ZKProofLike,
    options?: RelayerInputProofOptionsType,
  ) => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
  generateKeypair: () => { publicKey: string; privateKey: string };
  createEIP712: (
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: string | number,
    durationDays: string | number,
  ) => EIP712;
  publicDecrypt: (
    handles: (string | Uint8Array)[],
    options?: RelayerPublicDecryptOptionsType,
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
    options?: RelayerUserDecryptOptionsType,
  ) => Promise<UserDecryptResults>;
  getPublicKey: () => { publicKeyId: string; publicKey: Uint8Array } | null;
  getPublicParams: (bits: keyof PublicParams<Uint8Array>) => {
    publicParams: Uint8Array;
    publicParamsId: string;
  } | null;
};

////////////////////////////////////////////////////////////////////////////////
// createInstance
////////////////////////////////////////////////////////////////////////////////

export const createInstance = async (
  config: FhevmInstanceConfig,
): Promise<FhevmInstance> => {
  const relayerFhevm = await createRelayerFhevm({
    ...config,
    defaultRelayerVersion: 1,
  });

  const auth = config.auth;
  const aclContractAddress =
    relayerFhevm.fhevmHostChain.config.aclContractAddress;
  const verifyingContractAddressInputVerification =
    relayerFhevm.fhevmHostChain.config
      .verifyingContractAddressInputVerification;
  const verifyingContractAddressDecryption =
    relayerFhevm.fhevmHostChain.config.verifyingContractAddressDecryption;
  const gatewayChainId = BigInt(relayerFhevm.fhevmHostChain.gatewayChainId);

  const chainId = Number(relayerFhevm.fhevmHostChain.config.chainId);
  const kmsSigners = relayerFhevm.fhevmHostChain.kmsSigners;
  const thresholdKMSSigners = relayerFhevm.fhevmHostChain.kmsSignerThreshold;
  const coprocessorSigners = relayerFhevm.fhevmHostChain.coprocessorSigners;
  const thresholdCoprocessorSigners =
    relayerFhevm.fhevmHostChain.coprocessorSignerThreshold;
  const provider = relayerFhevm.fhevmHostChain.config.ethersProvider;

  return {
    createEncryptedInput: createRelayerEncryptedInput({
      fhevm: relayerFhevm,
      capacity: 2048,
      defaultOptions: auth ? { auth } : undefined,
    }),
    requestZKProofVerification: async (
      zkProof: ZKProofLike,
      options?: RelayerInputProofOptionsType,
    ): Promise<{
      handles: Uint8Array[];
      inputProof: Uint8Array;
    }> => {
      if (
        zkProof.chainId !== BigInt(chainId) ||
        zkProof.aclContractAddress !== aclContractAddress
      ) {
        throw new Error('Invalid ZKProof');
      }
      const ip = await requestCiphertextWithZKProofVerification({
        zkProof: ZKProof.fromComponents(zkProof, {
          copy: false /* the ZKProof behaves as a validator and is not meant to be shared */,
        }),
        coprocessorSignersVerifier: CoprocessorSignersVerifier.fromAddresses({
          coprocessorSigners: coprocessorSigners,
          gatewayChainId: BigInt(gatewayChainId),
          threshold: thresholdCoprocessorSigners,
          verifyingContractAddressInputVerification,
        }),
        extraData: '0x00' as BytesHex,
        relayerProvider: relayerFhevm.relayerProvider,
        options,
      });

      return ip.toBytes();
    },
    generateKeypair,
    createEIP712: createEIP712(verifyingContractAddressDecryption, chainId),
    publicDecrypt: publicDecryptRequest(
      kmsSigners,
      thresholdKMSSigners,
      Number(gatewayChainId),
      verifyingContractAddressDecryption,
      aclContractAddress,
      relayerFhevm.relayerProvider,
      provider,
      auth && { auth },
    ),
    userDecrypt: userDecryptRequest(
      kmsSigners,
      Number(gatewayChainId),
      chainId,
      verifyingContractAddressDecryption,
      aclContractAddress,
      relayerFhevm.relayerProvider,
      provider,
      auth && { auth },
    ),
    getPublicKey: () => {
      const pk = relayerFhevm.getPublicKeyBytes();
      return {
        publicKey: pk.bytes,
        publicKeyId: pk.id,
      };
    },
    getPublicParams: (capacity: keyof PublicParams<Uint8Array>) => {
      if (relayerFhevm.supportsCapacity(capacity)) {
        const crs = relayerFhevm.getPkeCrsBytesForCapacity(capacity);
        return {
          publicParamsId: crs.id,
          publicParams: crs.bytes,
        };
      } else {
        return null;
      }
    },
  };
};
