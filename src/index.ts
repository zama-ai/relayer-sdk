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
// MainnetConfig
////////////////////////////////////////////////////////////////////////////////

export const MainnetConfig: FhevmInstanceConfig = {
  aclContractAddress: '0xcA2E8f1F656CD25C01F05d0b243Ab1ecd4a8ffb6',
  kmsContractAddress: '0x77627828a55156b04Ac0DC0eb30467f1a552BB03',
  inputVerifierContractAddress: '0xCe0FC2e05CFff1B719EFF7169f7D80Af770c8EA2',
  verifyingContractAddressDecryption:
    '0x0f6024a97684f7d90ddb0fAAD79cB15F2C888D24',
  verifyingContractAddressInputVerification:
    '0xcB1bB072f38bdAF0F328CdEf1Fc6eDa1DF029287',
  chainId: 1,
  gatewayChainId: 261131,
  network: 'https://ethereum-rpc.publicnode.com',
  relayerUrl: 'https://relayer.mainnet.zama.org',
} as const;
Object.freeze(MainnetConfig);

////////////////////////////////////////////////////////////////////////////////
// SepoliaConfig
////////////////////////////////////////////////////////////////////////////////

export const SepoliaConfig: FhevmInstanceConfig = {
  aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
  kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
  inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
  verifyingContractAddressDecryption:
    '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
  verifyingContractAddressInputVerification:
    '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
  chainId: 11155111,
  gatewayChainId: 10901,
  network: 'https://ethereum-sepolia-rpc.publicnode.com',
  relayerUrl: 'https://relayer.testnet.zama.org',
} as const;
Object.freeze(SepoliaConfig);

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
