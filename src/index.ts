import type {
  RelayerInputProofOptions,
  RelayerKeyUrlOptions,
  RelayerPublicDecryptOptions,
  RelayerUserDecryptOptions,
} from '@relayer/types/public-api';
import type { Auth } from '@relayer/types/public-api';
import type { Prettify } from '@base/types/utils';
import type {
  Bytes,
  Bytes32Hex,
  BytesHex,
  BytesHexNo0x,
  ChecksummedAddress,
  UintNumber,
} from '@base/types/primitives';
import type { Eip1193Provider, Provider } from 'ethers';
import type {
  DecryptedFhevmHandle,
  EncryptionBits,
  FhevmHostChainConfig,
  InputProofBytes,
  InputVerifierContractData,
  KmsUserDecryptEIP712,
  PublicDecryptionProof,
  ZKProofLike,
} from '@fhevm-base/types/public-api';
import { fetchFhevmConfig } from '@fhevm-base/FhevmConfig';
import { createFhevmLibs } from '@fhevm-ethers/index';
import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { EIP712Lib, FhevmChainClient } from '@fhevm-base-types/public-api';
import {
  asBytes65Hex,
  bytesToHexLarge,
  hexToBytesFaster,
  isBytes,
} from '@base/bytes';
import { publicDecrypt, userDecrypt } from '@fhevm-base/decrypt';
import { toFhevmHandle } from '@fhevm-base/FhevmHandle';
import { createRelayerLib } from './relayer';
import { deserializeOrFetchTfhePublicEncryptionParams } from '@fhevm-base/keys/tfhe/TfhePublicEncryptionParams';
import { createTFHELib, createTKMSLib } from '@sdk/index';
import { createKmsUserDecryptEIP712 } from '@fhevm-base/kms/KmsEIP712';
import {
  addressToChecksummedAddress,
  asAddress,
  assertIsAddressArray,
} from '@base/address';
import { remove0x, removeSuffix } from '@base/string';
import { fetchInputProof } from '@fhevm-base/coprocessor/InputProof';
import {
  TfheCrsBytes,
  TfhePublicEncryptionParams,
  TfhePublicKeyBytes,
} from '@fhevm-base/types/private';
import { toZKProof } from '@fhevm-base/coprocessor/ZKProof';
import {
  createZKProofBuilder,
  ZKProofBuilder,
} from '@fhevm-base/coprocessor/ZKProofBuilder';
import { RelayerLib, TFHELib } from '@fhevm-base/types/libs';

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

const ZamaMainnetRelayerBaseUrl = 'https://relayer.mainnet.zama.org';
const ZamaMainnetRelayerUrlV2 = `${ZamaMainnetRelayerBaseUrl}/v2`;

const ZamaSepoliaRelayerBaseUrl = 'https://relayer.testnet.zama.org';
const ZamaSepoliaRelayerUrlV2 = `${ZamaSepoliaRelayerBaseUrl}/v2`;

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

type FhevmRelayerEncryptedInput = {
  readonly config: {
    readonly hostChainConfig: FhevmHostChainConfig;
    readonly inputVerifier: InputVerifierContractData;
  };
  readonly relayerUrl: string;
  readonly libs: {
    readonly relayerLib: RelayerLib;
    readonly eip712Lib: EIP712Lib;
    readonly tfheLib: TFHELib;
  };
  readonly batchRpcCalls?: boolean;
};

class RelayerEncryptedInputImpl implements RelayerEncryptedInput {
  readonly #builder: ZKProofBuilder;
  readonly #fhevm: FhevmRelayerEncryptedInput;
  readonly #contractAddress: string;
  readonly #userAddress: string;
  readonly #tfhePublicEncryptionParams: TfhePublicEncryptionParams;

  constructor(
    fhevm: FhevmRelayerEncryptedInput,
    params: {
      readonly contractAddress: string;
      readonly userAddress: string;
      readonly tfhePublicEncryptionParams: TfhePublicEncryptionParams;
    },
  ) {
    this.#builder = createZKProofBuilder();
    this.#fhevm = fhevm;
    this.#contractAddress = params.contractAddress;
    this.#userAddress = params.userAddress;
    this.#tfhePublicEncryptionParams = params.tfhePublicEncryptionParams;
  }

  addBool(value: boolean | number | bigint): this {
    this.#builder.addBool(value);
    return this;
  }

  add8(value: number | bigint): this {
    this.#builder.addUint8(value);
    return this;
  }

  add16(value: number | bigint): this {
    this.#builder.addUint16(value);
    return this;
  }

  add32(value: number | bigint): this {
    this.#builder.addUint32(value);
    return this;
  }

  add64(value: number | bigint): this {
    this.#builder.addUint64(value);
    return this;
  }

  add128(value: number | bigint): this {
    this.#builder.addUint128(value);
    return this;
  }

  add256(value: number | bigint): this {
    this.#builder.addUint256(value);
    return this;
  }

  addAddress(value: string): this {
    this.#builder.addAddress(value);
    return this;
  }

  getBits(): readonly EncryptionBits[] {
    return this.#builder.getBits();
  }

  generateZKProof() {
    return this.#builder.build(this.#fhevm, {
      contractAddress: this.#contractAddress,
      userAddress: this.#userAddress,
      tfhePublicEncryptionParams: this.#tfhePublicEncryptionParams,
    });
  }

  async encrypt(options?: RelayerInputProofOptions): Promise<InputProofBytes> {
    const zkProof = this.generateZKProof();
    const inputProof = await fetchInputProof(this.#fhevm, {
      zkProof: toZKProof(zkProof, {
        tfheLib: this.#fhevm.libs.tfheLib,
        copy: true,
      }),
      extraData: '0x00' as BytesHex,
      options,
    });

    return {
      handles: inputProof.externalHandles.map((h) => h.bytes32),
      inputProof: hexToBytesFaster(inputProof.bytesHex, { strict: true }),
    };
  }
}

export type HandleContractPair = {
  // Hex encoded bytes32 with 0x prefix.
  readonly handle: Bytes32Hex;
  // Hex encoded address with 0x prefix.
  readonly contractAddress: ChecksummedAddress;
};

export type ClearValueType = bigint | boolean | `0x${string}`;
export type ClearValues = Readonly<Record<`0x${string}`, ClearValueType>>;
export type PublicDecryptResults = Readonly<{
  clearValues: ClearValues;
  abiEncodedClearValues: `0x${string}`;
  decryptionProof: `0x${string}`;
}>;

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
  generateKeypair(): {
    publicKey: BytesHexNo0x;
    privateKey: BytesHexNo0x;
  };
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

  // 2. Libs
  const relayerLib = await createRelayerLib();
  const tfheLib = await createTFHELib();
  const tkmsLib = await createTKMSLib();
  const fhevmLibs = await createFhevmLibs();

  const fhevmChainClient: FhevmChainClient = {
    batchRpcCalls: config.batchRpcCalls,
    libs: fhevmLibs,
    nativeClient: ethersProvider,
  };
  Object.freeze(fhevmChainClient);

  const relayerUrl = _parseZamaRelayerUrl(config.relayerUrl);
  if (relayerUrl === null) {
    throw new Error(
      `Invalid relayerUrl: ${Object.prototype.toString.call(config.relayerUrl)}`,
    );
  }

  const keyUrlOptions: RelayerKeyUrlOptions = {
    auth: config.auth,
    debug: config.debug,
  };

  // 3. Fetch keys
  const tfhePublicEncryptionParams: TfhePublicEncryptionParams =
    await deserializeOrFetchTfhePublicEncryptionParams(
      {
        relayerUrl,
        libs: { tfheLib, relayerLib },
      },
      {
        options: keyUrlOptions,
        paramsBytes: _convertPublicKeySchema(config),
      },
    );

  // 4. Fetch config
  const fhevmConfig = await fetchFhevmConfig(fhevmChainClient, {
    ...config,
    kmsVerifierContractAddress: config.kmsContractAddress,
  });

  const requestZKProofVerification = async (
    zkProof: ZKProofLike,
    options?: RelayerInputProofOptions,
  ): Promise<InputProofBytes> => {
    const fhevm = {
      config: fhevmConfig,
      batchRpcCalls: config.batchRpcCalls,
      libs: {
        ...fhevmLibs,
        relayerLib,
      },
      nativeClient: ethersProvider,
      relayerUrl,
    };

    const inputProof = await fetchInputProof(fhevm, {
      zkProof: toZKProof(zkProof, { tfheLib, copy: true }),
      extraData: '0x00' as BytesHex,
      options,
    });

    return {
      handles: inputProof.externalHandles.map((h) => h.bytes32),
      inputProof: hexToBytesFaster(inputProof.bytesHex, { strict: true }),
    };
  };

  return {
    ////////////////////////////////////////////////////////////////////////////
    // createEncryptedInput
    ////////////////////////////////////////////////////////////////////////////

    createEncryptedInput: (
      contractAddress: string,
      userAddress: string,
    ): RelayerEncryptedInput => {
      const fhevm: FhevmRelayerEncryptedInput = {
        relayerUrl,
        libs: { tfheLib, relayerLib, eip712Lib: fhevmLibs.eip712Lib },
        config: fhevmConfig,
        batchRpcCalls: config.batchRpcCalls,
      };

      return new RelayerEncryptedInputImpl(fhevm, {
        contractAddress,
        userAddress,
        tfhePublicEncryptionParams,
      });
    },

    ////////////////////////////////////////////////////////////////////////////
    // requestZKProofVerification
    ////////////////////////////////////////////////////////////////////////////

    requestZKProofVerification,

    ////////////////////////////////////////////////////////////////////////////
    // createEIP712
    ////////////////////////////////////////////////////////////////////////////

    generateKeypair: (): {
      publicKey: BytesHexNo0x;
      privateKey: BytesHexNo0x;
    } => {
      const tkmsPrivateKey = tkmsLib.generateTkmsPrivateKey();
      const tkmsPrivateKeyBytes =
        tkmsLib.serializeTkmsPrivateKey(tkmsPrivateKey);

      return {
        publicKey: remove0x(
          tkmsLib.getTkmsPublicKeyHex(tkmsPrivateKey),
        ) as BytesHexNo0x,
        privateKey: bytesToHexLarge(tkmsPrivateKeyBytes, true /* no0x */),
      };
    },

    ////////////////////////////////////////////////////////////////////////////
    // createEIP712
    ////////////////////////////////////////////////////////////////////////////

    createEIP712: (
      publicKey: string,
      contractAddresses: string[],
      startTimestamp: number,
      durationDays: number,
    ): KmsUserDecryptEIP712 => {
      return createKmsUserDecryptEIP712(
        { config: fhevmConfig },
        {
          publicKey,
          startTimestamp,
          durationDays,
          contractAddresses,
          extraData: '0x00',
        },
      );
    },

    ////////////////////////////////////////////////////////////////////////////
    // publicDecrypt
    ////////////////////////////////////////////////////////////////////////////

    publicDecrypt: async (
      handles: readonly (string | Uint8Array)[],
      options?: RelayerPublicDecryptOptions,
    ): Promise<PublicDecryptResults> => {
      const fhevm = {
        config: fhevmConfig,
        batchRpcCalls: config.batchRpcCalls,
        libs: {
          ...fhevmLibs,
          relayerLib,
        },
        nativeClient: ethersProvider,
        relayerUrl,
      };

      const proof: PublicDecryptionProof = await publicDecrypt(fhevm, {
        handles: handles.map(toFhevmHandle),
        extraData: '0x00' as BytesHex,
        options,
      });

      return _toPublicDecryptResults(proof);
    },

    ////////////////////////////////////////////////////////////////////////////
    // userDecrypt
    ////////////////////////////////////////////////////////////////////////////

    userDecrypt: async (
      handles: HandleContractPair[],
      privateKey: string,
      _publicKey: string,
      signature: string,
      contractAddresses: string[],
      userAddress: string,
      startTimestamp: string | number,
      durationDays: string | number,
      options?: RelayerUserDecryptOptions,
    ): Promise<ClearValues> => {
      const fhevm = {
        config: fhevmConfig,
        batchRpcCalls: config.batchRpcCalls,
        libs: {
          ...fhevmLibs,
          relayerLib,
          tkmsLib,
        },
        nativeClient: ethersProvider,
        relayerUrl,
      };

      const handleContractPairs = handles.map((h) => {
        return {
          handle: toFhevmHandle(h.handle),
          contractAddress: addressToChecksummedAddress(
            asAddress(h.contractAddress),
          ),
        };
      });
      assertIsAddressArray(contractAddresses, {});

      const tkmsPrivateKeyBytes: Bytes = hexToBytesFaster(privateKey, {
        strict: true,
      });
      const tkmsPrivateKey =
        tkmsLib.deserializeTkmsPrivateKey(tkmsPrivateKeyBytes);

      // 1. Call user decrypt
      const decryptedHandles: readonly DecryptedFhevmHandle[] =
        await userDecrypt(fhevm, {
          handleContractPairs,
          tkmsPrivateKey,
          userDecryptEIP712Message: {
            contractAddresses: contractAddresses.map(
              addressToChecksummedAddress,
            ),
            durationDays: String(durationDays),
            startTimestamp: String(startTimestamp),
            extraData: '0x00' as BytesHex,
          },
          userDecryptEIP712Signature: asBytes65Hex(signature),
          userDecryptEIP712Signer: addressToChecksummedAddress(
            asAddress(userAddress),
          ),
          options,
        });

      // 2. Build the return type in the expected format
      const clearValues: Record<string, ClearValueType> = {};
      decryptedHandles.forEach(
        (decryptedHandle) =>
          (clearValues[decryptedHandle.handle.bytes32Hex] =
            decryptedHandle.value as ClearValueType),
      );
      Object.freeze(clearValues);
      return clearValues;
    },

    ////////////////////////////////////////////////////////////////////////////
    // getPublicKey
    ////////////////////////////////////////////////////////////////////////////

    getPublicKey: () => {
      const publicKeyBytes = tfheLib.serializeTfhePublicKey(
        tfhePublicEncryptionParams.publicKey,
      );
      return {
        publicKeyId: publicKeyBytes.id,
        publicKey: publicKeyBytes.bytes,
      };
    },

    ////////////////////////////////////////////////////////////////////////////
    // getPublicParams
    ////////////////////////////////////////////////////////////////////////////

    getPublicParams: () => {
      // 2048 is the only supported capacity
      // Assert 2048 mis?
      const crsBytes = tfheLib.serializeTfheCrs(tfhePublicEncryptionParams.crs);
      return {
        publicParamsId: crsBytes.id,
        publicParams: crsBytes.bytes,
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
      publicKey: TfhePublicKeyBytes;
      crs: TfheCrsBytes;
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
    } as TfhePublicKeyBytes,
    crs: {
      bytes: publicParams.publicParams,
      id: publicParams.publicParamsId,
      capacity: 2048 as UintNumber,
    } as TfheCrsBytes,
  };
}

function _toPublicDecryptResults(
  proof: PublicDecryptionProof,
): PublicDecryptResults {
  const clearValues: Record<string, ClearValueType> = {};

  proof.orderedDecryptedHandles.forEach(
    (decryptedHandle, idx) =>
      (clearValues[decryptedHandle.handle.bytes32Hex] =
        decryptedHandle.value as ClearValueType),
  );

  Object.freeze(clearValues);

  return Object.freeze({
    clearValues,
    decryptionProof: proof.decryptionProof,
    abiEncodedClearValues: proof.orderedAbiEncodedClearValues,
  });
}

function _parseZamaRelayerUrl(relayerUrl: unknown): string | null {
  if (
    relayerUrl === undefined ||
    relayerUrl === null ||
    typeof relayerUrl !== 'string'
  ) {
    return null;
  }

  const urlNoSlash = removeSuffix(relayerUrl, '/');
  if (!URL.canParse(urlNoSlash)) {
    return null;
  }

  if (
    urlNoSlash.startsWith(ZamaMainnetRelayerBaseUrl) ||
    urlNoSlash.startsWith(ZamaSepoliaRelayerBaseUrl)
  ) {
    const zamaUrls = [
      ZamaSepoliaRelayerBaseUrl,
      ZamaSepoliaRelayerUrlV2,
      ZamaMainnetRelayerBaseUrl,
      ZamaMainnetRelayerUrlV2,
    ];
    const isZamaUrl = zamaUrls.includes(urlNoSlash);
    if (isZamaUrl) {
      if (urlNoSlash.endsWith('/v2')) {
        return urlNoSlash;
      }
      return `${urlNoSlash}/v2`;
    }
    // malformed Zama url
    return null;
  }

  return urlNoSlash;
}
