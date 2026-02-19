import type {
  RelayerInputProofOptions,
  RelayerPublicDecryptOptions,
  RelayerUserDecryptOptions,
} from '@relayer/types/public-api';
import type { Auth } from '@relayer/types/public-api';
import type { Prettify } from '@base/types/utils';
import type {
  Bytes32Hex,
  BytesHex,
  BytesHexNo0x,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { Keypair, ZKProofLike } from '@sdk/types/public-api';
import type { InputProofBytes } from '@sdk/coprocessor/public-api';
import type {
  ClearValues,
  KmsUserDecryptEIP712,
  PublicDecryptResults,
} from '@sdk/kms/public-api';
import type { Eip1193Provider, Provider } from 'ethers';
import type { EncryptionBits } from '@fhevm-base/types/public-api';
import { parseZamaRelayerUrl } from '@relayer/relayerUrl';
import { fetchFhevmConfig } from '@fhevm-base/FhevmConfig';
import { createFhevmLibs } from '@fhevm-ethers/index';
import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { FhevmChainClient } from '@fhevm-base-types/public-api';
import { RelayerClient } from '@relayer/types/private-api';
import { TFHEPkeCrsBytes, TFHEPublicKeyBytes } from '@sdk/lowlevel/public-api';
import { isBytes } from '@base/bytes';
import { keyUrl } from '@relayer/keyUrl';
import { generateTKMSPkeKeypair } from '@sdk/lowlevel/TKMSPkeKeypair';
import { createKmsEIP712Builder } from '@sdk/kms/KmsEIP712Builder';
import { publicDecrypt } from '@relayer/publicDecrypt';
import { toFhevmHandle } from '@fhevm-base/FhevmHandle';
import { createRelayerZKProofBuilder } from '@relayer/RelayerZKProofBuilder';

////////////////////////////////////////////////////////////////////////////////
// FhevmInstanceConfig
////////////////////////////////////////////////////////////////////////////////

export type FhevmInstanceOptions = {
  auth?: Auth;
  debug?: boolean;
};

export type FhevmInstanceConfig = Prettify<
  {
    verifyingContractAddressDecryption: string;
    verifyingContractAddressInputVerification: string;
    kmsContractAddress: string;
    inputVerifierContractAddress: string;
    aclContractAddress: string;
    gatewayChainId: number;
    relayerUrl: string;
    network?: string | Eip1193Provider;
    chainId?: number;
    batchRpcCalls?: boolean;
    publicKey?: {
      data: Uint8Array;
      id: string;
    };
    publicParams?: {
      2048: {
        publicParams: Uint8Array;
        publicParamsId: string;
      };
    };
  } & FhevmInstanceOptions
>;

////////////////////////////////////////////////////////////////////////////////
// FhevmInstance
////////////////////////////////////////////////////////////////////////////////

export type RelayerEncryptedInput = {
  addBool: (value: boolean | number | bigint) => RelayerEncryptedInput;
  add8: (value: number | bigint) => RelayerEncryptedInput;
  add16: (value: number | bigint) => RelayerEncryptedInput;
  add32: (value: number | bigint) => RelayerEncryptedInput;
  add64: (value: number | bigint) => RelayerEncryptedInput;
  add128: (value: number | bigint) => RelayerEncryptedInput;
  add256: (value: number | bigint) => RelayerEncryptedInput;
  addAddress: (value: string) => RelayerEncryptedInput;
  getBits: () => readonly EncryptionBits[];
  generateZKProof(): {
    readonly chainId: bigint;
    readonly aclContractAddress: `0x${string}`;
    readonly contractAddress: `0x${string}`;
    readonly userAddress: `0x${string}`;
    readonly ciphertextWithZKProof: Uint8Array | string;
    readonly encryptionBits: readonly EncryptionBits[];
  };
  encrypt: (options?: RelayerInputProofOptions) => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
};

export type HandleContractPair = {
  // Hex encoded bytes32 with 0x prefix.
  readonly handle: Bytes32Hex;
  // Hex encoded address with 0x prefix.
  readonly contractAddress: ChecksummedAddress;
};

export interface FhevmInstance {
  createEncryptedInput(
    contractAddress: string,
    userAddress: string,
  ): RelayerEncryptedInput;
  requestZKProofVerification(
    zkProof: ZKProofLike,
    options?: RelayerInputProofOptions,
  ): Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
  generateKeypair(): Keypair<BytesHexNo0x>;
  createEIP712(
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: number,
    durationDays: number,
  ): KmsUserDecryptEIP712;
  publicDecrypt(
    handles: (string | Uint8Array)[],
    options?: RelayerPublicDecryptOptions,
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
    options?: RelayerUserDecryptOptions,
  ): Promise<ClearValues>;
  getPublicKey(): { publicKeyId: string; publicKey: Uint8Array };
  getPublicParams(): {
    publicParams: Uint8Array;
    publicParamsId: string;
  };
}

////////////////////////////////////////////////////////////////////////////////
// createInstance
////////////////////////////////////////////////////////////////////////////////

function getEthersProvider(
  network: string | Eip1193Provider | undefined,
): Provider {
  if (typeof network === 'string') {
    return new JsonRpcProvider(network);
  } else if (network) {
    return new BrowserProvider(network);
  }
  throw new Error(
    'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
  );
}

export const createInstance = async (
  config: FhevmInstanceConfig,
): Promise<FhevmInstance> => {
  // 1. Create Ethers Relayer Config
  const ethersProvider = getEthersProvider(config.network);
  const fhevmLibs = await createFhevmLibs();
  const client: FhevmChainClient = {
    batchRpcCalls: config.batchRpcCalls,
    libs: fhevmLibs,
    nativeClient: ethersProvider,
  };
  Object.freeze(client);

  const relayerUrl = parseZamaRelayerUrl(config.relayerUrl);
  if (relayerUrl === null) {
    throw new Error(
      `Invalid relayerUrl: ${Object.prototype.toString.call(config.relayerUrl)}`,
    );
  }

  // 2. Fetch keys
  const tfhePkeParams = await keyUrl({
    relayerUrl,
    tfhePkeParams: _convertPublicKeySchema(config),
  });

  const fhevmConfig = await fetchFhevmConfig(client, {
    ...config,
    kmsVerifierContractAddress: config.kmsContractAddress,
  });

  const relayerClient: RelayerClient = {
    fhevmChainClient: client,
    fhevmConfig,
    relayerUrl,
  };
  Object.freeze(relayerClient);

  return {
    createEncryptedInput: (
      contractAddress: string,
      userAddress: string,
    ): RelayerEncryptedInput => {
      return createRelayerZKProofBuilder(relayerClient, {
        contractAddress,
        userAddress,
        pkeParams: tfhePkeParams,
      });
    },
    requestZKProofVerification: async (
      _zkProof: ZKProofLike,
      _options?: RelayerInputProofOptions,
    ): Promise<InputProofBytes> => {
      throw new Error(`requestZKProofVerification is not implemented`);
    },
    generateKeypair: () => {
      return generateTKMSPkeKeypair().toBytesHexNo0x();
    },
    createEIP712: (
      publicKey: string,
      contractAddresses: string[],
      startTimestamp: number,
      durationDays: number,
    ): KmsUserDecryptEIP712 => {
      const builder = createKmsEIP712Builder({
        chainId: fhevmConfig.hostChainConfig.chainId,
        verifyingContractAddressDecryption:
          fhevmConfig.kmsVerifier.verifyingContractAddressDecryption,
      });
      return builder.createUserDecrypt({
        publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
        extraData: '0x00' as BytesHex,
      });
    },
    publicDecrypt: async (
      handles: readonly (string | Uint8Array)[],
      options?: RelayerPublicDecryptOptions,
    ): Promise<PublicDecryptResults> => {
      const res = await publicDecrypt(relayerClient, {
        handles: handles.map(toFhevmHandle),
        options,
        extraData: '0x00' as BytesHex,
      });
      return res.toPublicDecryptResults();
    },
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
      const pk = tfhePkeParams.tfhePublicKey.toBytes();
      return {
        publicKeyId: pk.id,
        publicKey: pk.bytes,
      };
    },
    getPublicParams: () => {
      // 2048 is the only supported capacity
      const crs = tfhePkeParams.tfhePkeCrs.getBytesForCapacity(2048);
      return {
        publicParamsId: crs.id,
        publicParams: crs.bytes,
      };
    },
  };
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
  relayerUrl: 'https://relayer.mainnet.zama.org/v2',
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
  relayerUrl: 'https://relayer.testnet.zama.org/v2',
} as const;
Object.freeze(SepoliaConfig);

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

/**
 * Converts the legacy gateway public key schema into the internal
 * `{ publicKey: TFHEPublicKeyBytes, pkeCrs: TFHEPkeCrsBytes }` format.
 *
 * Validates that all required fields are present and well-typed.
 *
 * @param params - The legacy gateway response containing optional `publicKey` and `publicParams`.
 * @returns The converted schema, or `undefined` if any required field is missing or invalid.
 */
function _convertPublicKeySchema(params: {
  publicKey?: {
    data: Uint8Array;
    id: string;
  };
  publicParams?: {
    2048: {
      publicParams: Uint8Array;
      publicParamsId: string;
    };
  };
}):
  | {
      publicKey: TFHEPublicKeyBytes;
      pkeCrs: TFHEPkeCrsBytes & { capacity: 2048 };
    }
  | undefined {
  if (params.publicKey === undefined || params.publicParams === undefined) {
    return undefined;
  }
  if (
    typeof params.publicKey.id !== 'string' ||
    !isBytes(params.publicKey.data)
  ) {
    return undefined;
  }
  const publicParams = params.publicParams[2048];
  if (typeof publicParams !== 'object' || publicParams === null) {
    return undefined;
  }
  if (
    typeof publicParams.publicParamsId !== 'string' ||
    !isBytes(publicParams.publicParams)
  ) {
    return undefined;
  }

  return {
    publicKey: {
      id: params.publicKey.id,
      bytes: params.publicKey.data,
    },
    pkeCrs: {
      bytes: publicParams.publicParams,
      id: publicParams.publicParamsId,
      capacity: 2048,
    },
  };
}
