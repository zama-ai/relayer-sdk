import type {
  Bytes,
  Bytes21Hex,
  Bytes32,
  Bytes32Hex,
  Bytes32HexAble,
  Bytes32HexNo0x,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint128BigInt,
  Uint16Number,
  Uint256BigInt,
  Uint32BigInt,
  Uint32Number,
  Uint64BigInt,
  Uint8Number,
} from '@base/types/primitives';
import type { Prettify } from '@base/types/utils';

////////////////////////////////////////////////////////////////////////////////
//
// DecryptedFheValue
//
////////////////////////////////////////////////////////////////////////////////

/**
 * Maps each {@link FheTypeName} to its branded clear-value type.
 *
 * - Small unsigned integers (8, 16, 32 bits) → `UintXXNumber` (fits in JS `number`)
 * - Large unsigned integers (64, 128, 256 bits) → `UintXXBigInt` (requires `bigint`)
 * - `ebool` → `boolean`
 * - `eaddress` → `ChecksummedAddress`
 */
export interface DecryptedFheValueMap extends Record<FheTypeName, unknown> {
  ebool: boolean;
  euint8: Uint8Number;
  euint16: Uint16Number;
  euint32: Uint32Number;
  euint64: Uint64BigInt;
  euint128: Uint128BigInt;
  euint256: Uint256BigInt;
  eaddress: ChecksummedAddress;
}

/**
 * Union of all branded clear-value types from {@link DecryptedFheValueMap}.
 * @internal
 */
export type DecryptedFheValue = DecryptedFheValueMap[FheTypeName];

export type DecryptedEboolValue = DecryptedFheValueMap['ebool'];
export type DecryptedEaddressValue = DecryptedFheValueMap['eaddress'];
export type DecryptedEuint8Value = DecryptedFheValueMap['euint8'];
export type DecryptedEuint16Value = DecryptedFheValueMap['euint16'];
export type DecryptedEuint32Value = DecryptedFheValueMap['euint32'];
export type DecryptedEuint64Value = DecryptedFheValueMap['euint64'];
export type DecryptedEuint128Value = DecryptedFheValueMap['euint128'];
export type DecryptedEuint256Value = DecryptedFheValueMap['euint256'];

////////////////////////////////////////////////////////////////////////////////
//
// FhevmHandle
//
////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __fhevmHandle: unique symbol;

export type FhevmHandleBrand = { readonly [__fhevmHandle]: never };
export type FhevmHandleBytes32 = Bytes32 & FhevmHandleBrand;
export type FhevmHandleBytes32Hex = Bytes32Hex & FhevmHandleBrand;
export type FhevmHandleBytes32HexNo0x = Bytes32HexNo0x & FhevmHandleBrand;

export interface FhevmHandleBytes32HexAble {
  // Core canonical representation
  readonly bytes32Hex: FhevmHandleBytes32Hex;
}

export interface FhevmHandleBytes32Able {
  // Core canonical representation
  readonly bytes32: FhevmHandleBytes32;
}

export interface FhevmHandle
  extends FhevmHandleBytes32HexAble,
    FhevmHandleBytes32Able {
  // Alternate representations
  readonly bytes32HexNo0x: FhevmHandleBytes32HexNo0x;
  readonly bytes32: FhevmHandleBytes32;

  // Parsed components
  readonly hash21: Bytes21Hex;
  readonly chainId: Uint64BigInt;
  readonly fheTypeId: FheTypeId;
  readonly fheTypeName: FheTypeName;
  readonly version: Uint8Number;
  readonly index: Uint8Number | undefined;
  readonly encryptionBits: EncryptionBits;
  readonly solidityPrimitiveTypeName: SolidityPrimitiveTypeName;
  readonly isComputed: boolean;
  readonly isExternal: boolean;
}

export interface FhevmHandleOfType<T extends FheTypeName> extends FhevmHandle {
  readonly fheTypeId: FheTypeNameToIdMap[T];
  readonly fheTypeName: T;
}

export interface FhevmExternalHandleOfType<T extends FheTypeName>
  extends FhevmHandleOfType<T> {
  readonly index: Uint8Number;
  readonly isComputed: false;
  readonly isExternal: true;
}

export type FhevmHandleLike =
  | Bytes32
  | Bytes32Hex
  | Bytes32HexAble
  | FhevmHandle;

////////////////////////////////////////////////////////////////////////////////

export type Ebool = FhevmHandleOfType<'ebool'>;
export type Euint8 = FhevmHandleOfType<'euint8'>;
export type Euint16 = FhevmHandleOfType<'euint16'>;
export type Euint32 = FhevmHandleOfType<'euint32'>;
export type Euint64 = FhevmHandleOfType<'euint64'>;
export type Euint128 = FhevmHandleOfType<'euint128'>;
export type Euint256 = FhevmHandleOfType<'euint256'>;
export type Eaddress = FhevmHandleOfType<'eaddress'>;

////////////////////////////////////////////////////////////////////////////////

export type ExternalEbool = FhevmExternalHandleOfType<'ebool'>;
export type ExternalEuint8 = FhevmExternalHandleOfType<'euint8'>;
export type ExternalEuint16 = FhevmExternalHandleOfType<'euint16'>;
export type ExternalEuint32 = FhevmExternalHandleOfType<'euint32'>;
export type ExternalEuint64 = FhevmExternalHandleOfType<'euint64'>;
export type ExternalEuint128 = FhevmExternalHandleOfType<'euint128'>;
export type ExternalEuint256 = FhevmExternalHandleOfType<'euint256'>;
export type ExternalEaddress = FhevmExternalHandleOfType<'eaddress'>;

export type ExternalFhevmHandle = FhevmExternalHandleOfType<FheTypeName>;

////////////////////////////////////////////////////////////////////////////////
//
// DecryptedFhevmHandle
//
////////////////////////////////////////////////////////////////////////////////

/**
 * A decrypted FHEVM handle: pairs an encrypted {@link FhevmHandle} with its
 * plaintext clear value.
 *
 * When `T` is a specific {@link FheTypeName} literal (e.g. `'ebool'`), this
 * resolves to a single concrete type. When `T` is the full `FheTypeName`
 * union (the default), it produces a **discriminated union** of all variants,
 * enabling narrowing via `fheTypeName`:
 *
 * ```typescript
 * declare const d: DecryptedFhevmHandle;
 * if (d.fheTypeName === 'ebool') {
 *   d.value; // boolean ✅
 * }
 * ```
 *
 * Instances are created internally via {@link createDecryptedFhevmHandle}
 * and can be checked with {@link isDecryptedFhevmHandle}.
 * Direct construction is not possible.
 *
 * @template T - The FHE type name ('ebool', 'euint8', 'eaddress', etc.)
 */
export type DecryptedFhevmHandle<T extends FheTypeName = FheTypeName> = {
  [K in T]: {
    readonly fheTypeName: K;
    readonly handle: FhevmHandleOfType<K>;
    readonly value: DecryptedFheValueMap[K];
  };
}[T];

export type DecryptedEbool = DecryptedFhevmHandle<'ebool'>;
export type DecryptedEuint8 = DecryptedFhevmHandle<'euint8'>;
export type DecryptedEuint16 = DecryptedFhevmHandle<'euint16'>;
export type DecryptedEuint32 = DecryptedFhevmHandle<'euint32'>;
export type DecryptedEuint64 = DecryptedFhevmHandle<'euint64'>;
export type DecryptedEuint128 = DecryptedFhevmHandle<'euint128'>;
export type DecryptedEuint256 = DecryptedFhevmHandle<'euint256'>;
export type DecryptedEaddress = DecryptedFhevmHandle<'eaddress'>;

////////////////////////////////////////////////////////////////////////////////
//
// PublicDecryptionProof
//
////////////////////////////////////////////////////////////////////////////////

export interface PublicDecryptionProof {
  readonly decryptionProof: BytesHex;
  readonly orderedDecryptedHandles: readonly DecryptedFhevmHandle[];
  readonly orderedAbiEncodedClearValues: BytesHex;
  readonly extraData: BytesHex;
}

////////////////////////////////////////////////////////////////////////////////
//
// FheType
//
////////////////////////////////////////////////////////////////////////////////

/**
 * **FHE Type Mapping for Input Builders**
 * * Maps the **number of encrypted bits** used by a FHEVM primary type
 * to its corresponding **FheTypeId**. This constant is primarily used by
 * `EncryptedInput` and `RelayerEncryptedInput` builders to determine the correct
 * input type and calculate the total required bit-length.
 *
 * **Structure: \{ Encrypted Bit Length: FheTypeId \}**
 *
 * | Bits | FheTypeId | FHE Type Name | Note |
 * | :--- | :-------- | :------------ | :--- |
 * | 2    | 0         | `ebool`         | The boolean type. |
 * | (N/A)| 1         | `euint4`        | **Deprecated** and omitted from this map. |
 * | 8    | 2         | `euint8`        | |
 * | 16   | 3         | `euint16`       | |
 * | 32   | 4         | `euint32`       | |
 * | 64   | 5         | `euint64`       | |
 * | 128  | 6         | `euint128`      | |
 * | 160  | 7         | `eaddress`      | Used for encrypted Ethereum addresses. |
 * | 256  | 8         | `euint256`      | The maximum supported integer size. |
 */
export type FheTypeName = keyof FheTypeNameToIdMap;
export type FheTypeId = keyof FheTypeIdToNameMap;
export type FheTypeEncryptionBitwidth = keyof FheTypeEncryptionBitwidthToIdMap;

export interface FheTypeNameToIdMap {
  ebool: 0;
  //euint4: 1; has been deprecated
  euint8: 2;
  euint16: 3;
  euint32: 4;
  euint64: 5;
  euint128: 6;
  eaddress: 7;
  euint256: 8;
}

export interface TypeNameToFheTypeNameMap {
  bool: 'ebool';
  uint8: 'euint8';
  uint16: 'euint16';
  uint32: 'euint32';
  uint64: 'euint64';
  uint128: 'euint128';
  uint256: 'euint256';
  address: 'eaddress';
}

export interface FheTypeIdToNameMap {
  0: 'ebool';
  //1: 'euint4' has been deprecated
  2: 'euint8';
  3: 'euint16';
  4: 'euint32';
  5: 'euint64';
  6: 'euint128';
  7: 'eaddress';
  8: 'euint256';
}

export type SolidityPrimitiveTypeName = 'bool' | 'uint256' | 'address';

/**
 * Bitwidth to FheTypeId
 */
export interface FheTypeEncryptionBitwidthToIdMap {
  2: FheTypeNameToIdMap['ebool'];
  // ??: FheTypeNameToIdMap['euint4'];
  8: FheTypeNameToIdMap['euint8'];
  16: FheTypeNameToIdMap['euint16'];
  32: FheTypeNameToIdMap['euint32'];
  64: FheTypeNameToIdMap['euint64'];
  128: FheTypeNameToIdMap['euint128'];
  160: FheTypeNameToIdMap['eaddress'];
  256: FheTypeNameToIdMap['euint256'];
}

/**
 * FheTypeId to Bitwidth
 */
export type FheTypeIdToEncryptionBitwidthMap = {
  [K in keyof FheTypeEncryptionBitwidthToIdMap as FheTypeEncryptionBitwidthToIdMap[K]]: K;
};

export type EncryptionBits = FheTypeEncryptionBitwidth;

export type EncryptionBitsTypeName = 'EncryptionBits';

export type FheTypedValue<T extends FheTypeName> = Readonly<{
  value: T extends 'ebool'
    ? boolean
    : T extends 'eaddress'
      ? string
      : number | bigint;
  fheType: T;
}>;

////////////////////////////////////////////////////////////////////////////////
//
// InputVerifier
//
////////////////////////////////////////////////////////////////////////////////

export type CoprocessorEIP712Domain = Readonly<{
  name: 'InputVerification';
  version: '1';
  chainId: bigint;
  verifyingContract: ChecksummedAddress;
}>;

export type CoprocessorEIP712Message = Readonly<{
  ctHandles: readonly Bytes32Hex[] | readonly Bytes32[];
  userAddress: ChecksummedAddress;
  contractAddress: ChecksummedAddress;
  contractChainId: bigint;
  extraData: BytesHex;
}>;

export type CoprocessorEIP712MessageHex = Readonly<{
  ctHandles: readonly Bytes32Hex[];
  userAddress: ChecksummedAddress;
  contractAddress: ChecksummedAddress;
  contractChainId: bigint;
  extraData: BytesHex;
}>;

export type CoprocessorEIP712Types = {
  readonly CiphertextVerification: readonly [
    { readonly name: 'ctHandles'; readonly type: 'bytes32[]' },
    { readonly name: 'userAddress'; readonly type: 'address' },
    { readonly name: 'contractAddress'; readonly type: 'address' },
    { readonly name: 'contractChainId'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type CoprocessorEIP712 = Prettify<{
  readonly domain: CoprocessorEIP712Domain;
  readonly types: CoprocessorEIP712Types;
  readonly message: CoprocessorEIP712Message;
}>;

export interface InputVerifierContractData {
  readonly address: ChecksummedAddress;
  readonly eip712Domain: CoprocessorEIP712Domain;
  readonly gatewayChainId: Uint64BigInt;
  readonly coprocessorSigners: ChecksummedAddress[];
  readonly coprocessorSignerThreshold: Uint8Number;
  readonly verifyingContractAddressInputVerification: ChecksummedAddress;

  has(signer: string): boolean;
}

////////////////////////////////////////////////////////////////////////////////
//
// KMSVerifier
//
////////////////////////////////////////////////////////////////////////////////

export type KmsEIP712Domain = Readonly<{
  name: 'Decryption';
  version: '1';
  chainId: bigint;
  verifyingContract: ChecksummedAddress;
}>;

export interface KMSVerifierContractData {
  readonly address: ChecksummedAddress;
  readonly eip712Domain: KmsEIP712Domain;
  readonly gatewayChainId: Uint64BigInt;
  readonly kmsSigners: readonly ChecksummedAddress[];
  readonly kmsSignerThreshold: Uint8Number;
  readonly verifyingContractAddressDecryption: ChecksummedAddress;

  has(signer: string): boolean;
}

export type KmsUserDecryptEIP712Types = {
  readonly EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  readonly UserDecryptRequestVerification: readonly [
    { readonly name: 'publicKey'; readonly type: 'bytes' },
    { readonly name: 'contractAddresses'; readonly type: 'address[]' },
    { readonly name: 'startTimestamp'; readonly type: 'uint256' },
    { readonly name: 'durationDays'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type KmsDelegateUserDecryptEIP712Types = {
  readonly EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  readonly DelegatedUserDecryptRequestVerification: readonly [
    { readonly name: 'publicKey'; readonly type: 'bytes' },
    { readonly name: 'contractAddresses'; readonly type: 'address[]' },
    { readonly name: 'startTimestamp'; readonly type: 'uint256' },
    { readonly name: 'durationDays'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
    { readonly name: 'delegatedAccount'; readonly type: 'address' },
  ];
};

export type KmsPublicDecryptEIP712Types = {
  readonly EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  readonly PublicDecryptVerification: readonly [
    { readonly name: 'ctHandles'; readonly type: 'bytes32[]' },
    { readonly name: 'decryptedResult'; readonly type: 'bytes' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type KmsUserDecryptEIP712Message = Readonly<{
  publicKey: BytesHex;
  contractAddresses: readonly ChecksummedAddress[];
  startTimestamp: string;
  durationDays: string;
  extraData: BytesHex;
}>;

export type KmsUserDecryptEIP712 = Prettify<{
  readonly domain: KmsEIP712Domain;
  readonly types: KmsUserDecryptEIP712Types;
  readonly message: KmsUserDecryptEIP712Message;
  readonly primaryType: 'UserDecryptRequestVerification';
}>;

export type KmsDelegatedUserDecryptEIP712Message = Prettify<
  KmsUserDecryptEIP712Message & {
    readonly delegatedAccount: ChecksummedAddress;
  }
>;

export type KmsDelegatedUserDecryptEIP712 = Readonly<{
  types: KmsDelegateUserDecryptEIP712Types;
  primaryType: 'DelegatedUserDecryptRequestVerification';
  domain: KmsEIP712Domain;
  message: KmsDelegatedUserDecryptEIP712Message;
}>;

export type KmsPublicDecryptEIP712Message = Readonly<{
  ctHandles: readonly Bytes32Hex[];
  decryptedResult: BytesHex;
  extraData: BytesHex;
}>;

export type KmsPublicDecryptEIP712 = Readonly<
  Prettify<{
    types: KmsPublicDecryptEIP712Types;
    primaryType: 'PublicDecryptVerification';
    domain: KmsEIP712Domain;
    message: KmsPublicDecryptEIP712Message;
  }>
>;

////////////////////////////////////////////////////////////////////////////////
//
// ACL
//
////////////////////////////////////////////////////////////////////////////////

export interface ACL {
  isAllowedForDecryption(
    handles: readonly FhevmHandleLike[],
    options?: { readonly checkArguments?: boolean },
  ): Promise<boolean[]>;
  isAllowedForDecryption(
    handles: FhevmHandleLike,
    options?: { readonly checkArguments?: boolean },
  ): Promise<boolean>;

  checkAllowedForDecryption(
    handles: readonly FhevmHandleLike[] | FhevmHandleLike,
    options?: { readonly checkArguments?: boolean },
  ): Promise<void>;

  persistAllowed(
    handleAddressPairs: Array<{
      readonly address: ChecksummedAddress;
      readonly handle: FhevmHandleLike;
    }>,
    options?: { readonly checkArguments?: boolean },
  ): Promise<boolean[]>;
  persistAllowed(
    handleAddressPairs: {
      readonly address: ChecksummedAddress;
      readonly handle: FhevmHandleLike;
    },
    options?: { readonly checkArguments?: boolean },
  ): Promise<boolean>;

  checkUserAllowedForDecryption(
    params: {
      readonly userAddress: ChecksummedAddress;
      readonly handleContractPairs:
        | {
            readonly contractAddress: ChecksummedAddress;
            readonly handle: FhevmHandleLike;
          }
        | ReadonlyArray<{
            readonly contractAddress: ChecksummedAddress;
            readonly handle: FhevmHandleLike;
          }>;
    },
    options?: { readonly checkArguments?: boolean },
  ): Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////
//
// FHEVMExecutor
//
////////////////////////////////////////////////////////////////////////////////

export interface FHEVMExecutorContractData {
  readonly address: ChecksummedAddress;
  readonly aclContractAddress: ChecksummedAddress;
  readonly inputVerifierContractAddress: ChecksummedAddress;
  readonly hcuLimitContractAddress: ChecksummedAddress;
  readonly handleVersion: Uint8Number;
}

////////////////////////////////////////////////////////////////////////////////
//
// Fhevm Configs
//
////////////////////////////////////////////////////////////////////////////////

export interface FhevmHostChainConfig {
  readonly chainId: Uint64BigInt;
  readonly aclContractAddress: ChecksummedAddress;
  readonly kmsVerifierContractAddress: ChecksummedAddress;
  readonly inputVerifierContractAddress: ChecksummedAddress;
}

export interface FhevmGatewayChainConfig {
  readonly chainId: Uint32BigInt;
  readonly verifyingContractAddressDecryption: ChecksummedAddress;
  readonly verifyingContractAddressInputVerification: ChecksummedAddress;
}

export interface FhevmConfig {
  readonly hostChainConfig: FhevmHostChainConfig;
  readonly gatewayChainConfig: FhevmGatewayChainConfig;
  readonly inputVerifier: InputVerifierContractData;
  readonly kmsVerifier: KMSVerifierContractData;
}

////////////////////////////////////////////////////////////////////////////////
//
// ZKProof
//
////////////////////////////////////////////////////////////////////////////////

export interface ZKProofLike {
  readonly chainId: bigint | number;
  readonly aclContractAddress: string;
  readonly contractAddress: string;
  readonly userAddress: string;
  readonly ciphertextWithZKProof: Uint8Array | string;
  readonly encryptionBits?: readonly number[];
}

export interface ZKProof {
  readonly chainId: Uint64BigInt;
  readonly aclContractAddress: ChecksummedAddress;
  readonly contractAddress: ChecksummedAddress;
  readonly userAddress: ChecksummedAddress;
  readonly ciphertextWithZKProof: Bytes;
  readonly encryptionBits: readonly EncryptionBits[];

  getFhevmHandles(): readonly FhevmHandle[];
}

////////////////////////////////////////////////////////////////////////////////
// InputProof Types
////////////////////////////////////////////////////////////////////////////////

export type InputProofBytes = Readonly<{
  handles: Uint8Array[];
  inputProof: Uint8Array;
}>;

export interface BaseInputProof {
  readonly bytesHex: BytesHex;
  readonly coprocessorSignatures: readonly Bytes65Hex[];
  readonly externalHandles: readonly ExternalFhevmHandle[];
  readonly extraData: BytesHex;
  toBytes(): InputProofBytes;
}

export interface UnverifiedInputProof extends BaseInputProof {
  readonly coprocessorSignedParams?: undefined;
}

export interface VerifiedInputProof extends BaseInputProof {
  readonly coprocessorSignedParams: {
    readonly contractAddress: ChecksummedAddress;
    readonly userAddress: ChecksummedAddress;
  };
}

export type InputProof = UnverifiedInputProof | VerifiedInputProof;

export declare const KmsSigncryptedSharesBrand: unique symbol;
export interface KmsSigncryptedShares {
  readonly [KmsSigncryptedSharesBrand]: never;
}
