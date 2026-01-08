import type {
  RelayerEncryptedInput,
  RelayerInputProofOptionsType,
  RelayerPublicDecryptOptionsType,
  RelayerUserDecryptOptionsType,
} from './relayer-provider/types/public-api';
import type { Prettify, PartialWithUndefined } from './base/types/utils';
import type {
  BytesHex,
  BytesHexNo0x,
  ZKProofLike,
} from './base/types/primitives';
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
import type {
  FhevmConfigType,
  InputProofBytesType,
  KeypairType,
  KmsUserDecryptEIP712Type,
} from './sdk';
import { userDecryptRequest } from './relayer/userDecrypt';
import {
  createRelayerEncryptedInput,
  requestCiphertextWithZKProofVerification,
} from './relayer/sendEncryption';
import { publicDecryptRequest } from './relayer/publicDecrypt';
import { AbstractRelayerProvider } from './relayer-provider/AbstractRelayerProvider';
import { createRelayerFhevm } from './relayer-provider/createRelayerFhevm';
import { ZKProof } from './sdk/ZKProof';
import { TFHEPkeCrs } from './sdk/lowlevel/TFHEPkeCrs';
import { TFHEPkeParams } from './sdk/lowlevel/TFHEPkeParams';
import { TFHEPublicKey } from './sdk/lowlevel/TFHEPublicKey';
import { TFHEZKProofBuilder } from './sdk/lowlevel/TFHEZKProofBuilder';
import { RelayerZKProofBuilder } from './relayer-provider/RelayerZKProofBuilder';
import { CoprocessorSignersVerifier } from './sdk/coprocessor/CoprocessorSignersVerifier';
import { InputProof } from './sdk/coprocessor/InputProof';
import { KmsEIP712, TKMSPkeKeypair } from './sdk';

export { getErrorCauseStatus, getErrorCauseCode } from './relayer/error';
export type { EncryptionBits } from './base/types/primitives';
export type { RelayerEncryptedInput, HandleContractPair, PublicParams };
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
  PartialWithUndefined,
};

export {
  TFHEPkeCrs,
  TFHEPkeParams,
  TFHEPublicKey,
  TFHEZKProofBuilder,
  RelayerZKProofBuilder,
  AbstractRelayerProvider,
  ZKProof,
  InputProof,
};

////////////////////////////////////////////////////////////////////////////////
// FhevmInstance
////////////////////////////////////////////////////////////////////////////////

export interface FhevmInstance {
  config: FhevmConfigType;
  createEncryptedInput(
    contractAddress: string,
    userAddress: string,
  ): RelayerEncryptedInput;
  requestZKProofVerification(
    zkProof: ZKProofLike,
    options?: RelayerInputProofOptionsType,
  ): Promise<InputProofBytesType>;
  generateKeypair(): KeypairType<BytesHexNo0x>;
  createEIP712(
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: number,
    durationDays: number,
  ): KmsUserDecryptEIP712Type;
  publicDecrypt(
    handles: (string | Uint8Array)[],
    options?: RelayerPublicDecryptOptionsType,
  ): Promise<PublicDecryptResults>;
  userDecrypt(
    handles: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: string | number,
    durationDays: string | number,
    options?: RelayerUserDecryptOptionsType,
  ): Promise<UserDecryptResults>;
  getPublicKey(): { publicKeyId: string; publicKey: Uint8Array } | null;
  getPublicParams(bits: keyof PublicParams<Uint8Array>): {
    publicParams: Uint8Array;
    publicParamsId: string;
  } | null;
}

////////////////////////////////////////////////////////////////////////////////
// createInstance
////////////////////////////////////////////////////////////////////////////////

export const createInstance = async (
  config: FhevmInstanceConfig,
): Promise<FhevmInstance> => {
  const relayerFhevm = await createRelayerFhevm({
    ...config,
    defaultRelayerVersion: 2,
  });

  const auth = config.auth;
  const defaultOptions = {
    ...(auth != null && { auth }),
    debug: config.debug,
  };

  const aclContractAddress = relayerFhevm.fhevmHostChain.aclContractAddress;
  const verifyingContractAddressInputVerification =
    relayerFhevm.fhevmHostChain.verifyingContractAddressInputVerification;
  const verifyingContractAddressDecryption =
    relayerFhevm.fhevmHostChain.verifyingContractAddressDecryption;
  const gatewayChainId = BigInt(relayerFhevm.fhevmHostChain.gatewayChainId);

  const chainId = Number(relayerFhevm.fhevmHostChain.chainId);
  const kmsSigners = relayerFhevm.fhevmHostChain.kmsSigners;
  const thresholdKMSSigners = relayerFhevm.fhevmHostChain.kmsSignerThreshold;
  const coprocessorSigners = relayerFhevm.fhevmHostChain.coprocessorSigners;
  const thresholdCoprocessorSigners =
    relayerFhevm.fhevmHostChain.coprocessorSignerThreshold;
  const provider = relayerFhevm.fhevmHostChain.ethersProvider;

  return {
    config: relayerFhevm.fhevmHostChain,
    createEncryptedInput: createRelayerEncryptedInput({
      fhevm: relayerFhevm,
      capacity: 2048,
      defaultOptions,
    }),
    requestZKProofVerification: async (
      zkProof: ZKProofLike,
      options?: RelayerInputProofOptionsType,
    ): Promise<InputProofBytesType> => {
      if (
        zkProof.chainId !== BigInt(chainId) ||
        zkProof.aclContractAddress !== aclContractAddress
      ) {
        throw new Error('Invalid ZKProof');
      }

      const coprocessorSignersVerifier =
        CoprocessorSignersVerifier.fromAddresses({
          coprocessorSigners: coprocessorSigners,
          gatewayChainId: BigInt(gatewayChainId),
          coprocessorSignerThreshold: thresholdCoprocessorSigners,
          verifyingContractAddressInputVerification,
        });

      const ip = await requestCiphertextWithZKProofVerification({
        zkProof: ZKProof.fromComponents(zkProof, {
          copy: false /* the ZKProof behaves as a validator and is not meant to be shared */,
        }),
        coprocessorSignersVerifier,
        extraData: '0x00' as BytesHex,
        relayerProvider: relayerFhevm.relayerProvider,
        options: {
          ...defaultOptions,
          ...options,
        },
      });

      return ip.toBytes();
    },
    generateKeypair: () => {
      return TKMSPkeKeypair.generate().toBytesHexNo0x();
    },
    createEIP712: (
      publicKey: string,
      contractAddresses: string[],
      startTimestamp: number,
      durationDays: number,
    ): KmsUserDecryptEIP712Type => {
      const kmsEIP712 = new KmsEIP712({
        chainId: BigInt(chainId),
        verifyingContractAddressDecryption,
      });
      return kmsEIP712.createUserDecryptEIP712({
        publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
        extraData: '0x00',
      });
    },
    publicDecrypt: publicDecryptRequest({
      kmsSigners,
      thresholdSigners: thresholdKMSSigners,
      gatewayChainId: Number(gatewayChainId),
      verifyingContractAddressDecryption,
      aclContractAddress,
      relayerProvider: relayerFhevm.relayerProvider,
      provider,
      defaultOptions,
    }),
    userDecrypt: userDecryptRequest({
      kmsSigners,
      gatewayChainId: Number(gatewayChainId),
      chainId: chainId,
      verifyingContractAddressDecryption,
      aclContractAddress,
      relayerProvider: relayerFhevm.relayerProvider,
      provider,
      defaultOptions,
    }),
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
