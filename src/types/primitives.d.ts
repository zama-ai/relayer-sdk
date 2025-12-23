import { Prettify } from '../utils/types';

export type Bytes = Uint8Array;
export type Bytes8 = Uint8Array;
export type Bytes32 = Uint8Array;
export type BytesHex = `0x${string}`;
export type BytesHexNo0x = string;
export type Bytes21Hex = `0x${string}`;
export type Bytes32Hex = `0x${string}`;
export type Bytes = Uint8Array;
export type Bytes32 = Uint8Array;
export type Bytes65 = Uint8Array;
export type Bytes32HexNo0x = string;
export type Bytes65Hex = `0x${string}`;
export type Bytes65HexNo0x = string;

export type ChecksummedAddress = `0x${string}`;

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

export type FheTypeName = Prettify<keyof FheTypeNameToIdMap>;
export type FheTypeId = Prettify<keyof FheTypeIdToNameMap>;
export type FheTypeEncryptionBitwidth = Prettify<
  keyof FheTypeEncryptionBitwidthToIdMap
>;

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

// Invert FheTypeEncryptionBitwidthToIdMap to get FheTypeId -> Bitwidth
export type FheTypeIdToEncryptionBitwidthMap = {
  [K in keyof FheTypeEncryptionBitwidthToIdMap as FheTypeEncryptionBitwidthToIdMap[K]]: K;
};

export type EncryptionBits = Prettify<keyof FheTypeEncryptionBitwidthToIdMap>;

export type ZKProof = {
  chainId: number;
  aclContractAddress: ChecksummedAddress;
  contractAddress: ChecksummedAddress;
  userAddress: ChecksummedAddress;
  ciphertextWithZkProof: Uint8Array;
  bits: EncryptionBits[];
};

export type FheTypedValue<T extends FheTypeName> = {
  value: T extends 'ebool'
    ? boolean
    : T extends 'eaddress'
      ? string
      : number | bigint;
  fheType: T;
};
