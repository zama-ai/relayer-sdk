import type { HandleContractPair } from './relayer/userDecrypt';
import type { RelayerEncryptedInput } from './relayer/sendEncryption';
import type {
  RelayerV2InputProofOptions,
  RelayerV2PublicDecryptOptions,
  RelayerV2UserDecryptOptions,
} from './relayer-provider/v2/types/types';
import type { EIP712, EIP712Type } from './sdk/keypair';
import type { BytesHex, ZKProof } from './types/primitives';
import type {
  Auth,
  ApiKeyCookie,
  ApiKeyHeader,
  BearerToken,
  ClearValues,
  ClearValueType,
  FhevmInstanceConfig,
  FhevmInstanceOptions,
  PublicDecryptResults,
  PublicParams,
  UserDecryptResults,
} from './types/relayer';
import { isChecksummedAddress } from './utils/address';
import {
  getChainId,
  getCoprocessorSigners,
  getCoprocessorSignersThreshold,
  getKMSSigners,
  getKMSSignersThreshold,
  getProvider,
} from './config';
import { userDecryptRequest } from './relayer/userDecrypt';
import {
  createRelayerEncryptedInput,
  requestCiphertextWithZKProofVerification,
} from './relayer/sendEncryption';
import { publicDecryptRequest } from './relayer/publicDecrypt';
import { createRelayerFhevm } from './relayer-provider/createRelayerFhevm';
import { generateKeypair, createEIP712 } from './sdk/keypair';

// Disable global use of fetch-retry
// Make sure `workerHelpers.js` behaviour is consistant and tfhe WASM module is
// still running in MT mode
//global.fetch = fetchRetry(global.fetch, { retries: 5, retryDelay: 500 });

export { generateKeypair, createEIP712 };
export { getErrorCauseStatus, getErrorCauseCode } from './relayer/error';
export type { EncryptionBits } from './types/primitives';
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
export type {
  PublicDecryptResults,
  UserDecryptResults,
  ClearValueType,
  ClearValues,
  FhevmInstanceConfig,
  FhevmInstanceOptions,
  ZKProof,
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
    zkProof: ZKProof,
    options?: RelayerV2InputProofOptions,
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
    options?: RelayerV2PublicDecryptOptions,
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
    options?: RelayerV2UserDecryptOptions,
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
  const {
    verifyingContractAddressDecryption,
    verifyingContractAddressInputVerification,
    publicKey,
    inputVerifierContractAddress,
    kmsContractAddress,
    aclContractAddress,
    gatewayChainId,
    auth,
  } = config;

  if (!isChecksummedAddress(aclContractAddress)) {
    throw new Error('ACL contract address is not valid or empty');
  }
  if (!isChecksummedAddress(inputVerifierContractAddress)) {
    throw new Error('InputVerifier contract address is not valid or empty');
  }
  if (!isChecksummedAddress(kmsContractAddress)) {
    throw new Error('KMS contract address is not valid or empty');
  }
  if (!isChecksummedAddress(verifyingContractAddressDecryption)) {
    throw new Error(
      'Verifying contract for Decryption address is not valid or empty',
    );
  }
  if (!isChecksummedAddress(verifyingContractAddressInputVerification)) {
    throw new Error(
      'Verifying contract for InputVerification address is not valid or empty',
    );
  }

  if (publicKey && !(publicKey.data instanceof Uint8Array)) {
    throw new Error('publicKey must be a Uint8Array');
  }

  // TODO change argument
  // provider is never undefined | null here!
  const provider = getProvider(config.network);

  const relayerUrl = config.relayerUrl ?? SepoliaConfig.relayerUrl!;
  const relayerFhevm = await createRelayerFhevm({
    relayerUrl,
    publicKey: config.publicKey,
    publicParams: config.publicParams,
    defaultRelayerVersion: 1,
  });

  const chainId = await getChainId(provider, config);

  const kmsSigners = await getKMSSigners(provider, kmsContractAddress);

  const thresholdKMSSigners = await getKMSSignersThreshold(
    provider,
    kmsContractAddress,
  );

  const coprocessorSigners = await getCoprocessorSigners(
    provider,
    inputVerifierContractAddress,
  );

  const thresholdCoprocessorSigners = await getCoprocessorSignersThreshold(
    provider,
    inputVerifierContractAddress,
  );

  const tfheCompactPublicKeyWasm = relayerFhevm.getPublicKeyWasm().wasm;
  const tfheCompactPkeCrs2048Wasm = relayerFhevm.getPkeCrsWasmForCapacity(2048);

  return {
    createEncryptedInput: createRelayerEncryptedInput({
      aclContractAddress,
      verifyingContractAddressInputVerification,
      chainId,
      gatewayChainId,
      relayerProvider: relayerFhevm.relayerProvider,
      tfheCompactPublicKey: tfheCompactPublicKeyWasm,
      tfheCompactPkeCrs: tfheCompactPkeCrs2048Wasm.wasm,
      coprocessorSigners,
      thresholdCoprocessorSigners,
      capacity: 2048,
      defaultOptions: auth ? { auth } : undefined,
    }),
    requestZKProofVerification: (
      zkProof: ZKProof,
      options?: RelayerV2InputProofOptions,
    ) => {
      if (
        zkProof.chainId !== BigInt(chainId) ||
        zkProof.aclContractAddress !== aclContractAddress
      ) {
        throw new Error('Invalid ZKProof');
      }
      return requestCiphertextWithZKProofVerification({
        ciphertext: zkProof.ciphertextWithZkProof, // ZKProof
        aclContractAddress: aclContractAddress, // ZKProof
        contractAddress: zkProof.contractAddress, // ZKProof
        userAddress: zkProof.userAddress, // ZKProof
        chainId, // ZKProof
        bits: zkProof.bits, // ZKProof
        gatewayChainId,
        coprocessorSigners,
        extraData: '0x00' as BytesHex,
        thresholdCoprocessorSigners,
        relayerProvider: relayerFhevm.relayerProvider,
        verifyingContractAddressInputVerification:
          verifyingContractAddressInputVerification,
        options,
      });
    },
    generateKeypair,
    createEIP712: createEIP712(verifyingContractAddressDecryption, chainId),
    publicDecrypt: publicDecryptRequest(
      kmsSigners,
      thresholdKMSSigners,
      gatewayChainId,
      verifyingContractAddressDecryption,
      aclContractAddress,
      relayerFhevm.relayerProvider,
      provider,
      auth && { auth },
    ),
    userDecrypt: userDecryptRequest(
      kmsSigners,
      gatewayChainId,
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

    // getPublicKey: () =>
    //   publicKeyData.publicKey
    //     ? {
    //         publicKey: publicKeyData.publicKey.safe_serialize(
    //           SERIALIZED_SIZE_LIMIT_PK,
    //         ),
    //         publicKeyId: publicKeyData.publicKeyId,
    //       }
    //     : null,
    // getPublicParams: (bits: keyof PublicParams) => {
    //   if (publicParamsData[bits]) {
    //     return {
    //       publicParams: publicParamsData[bits]!.publicParams.safe_serialize(
    //         SERIALIZED_SIZE_LIMIT_CRS,
    //       ),
    //       publicParamsId: publicParamsData[bits]!.publicParamsId,
    //     };
    //   }
    //   return null;
    // },
  };
};
