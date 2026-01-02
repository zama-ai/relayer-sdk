import type {
  EncryptionBits,
  FheTypeEncryptionBitwidthToIdMap,
  FheTypeId,
  FheTypeIdToEncryptionBitwidthMap,
  FheTypeIdToNameMap,
  FheTypeName,
  FheTypeNameToIdMap,
  SolidityPrimitiveTypeName,
} from '@base/types/primitives';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import { FheTypeError } from '../errors/FheTypeError';

////////////////////////////////////////////////////////////////////////////////

// TFHE encryption requires a minimum of 2 bits per value.
// Booleans use 2 bits despite only needing 1 bit for the value itself.
const MINIMUM_ENCRYPTION_BIT_WIDTH = 2;

////////////////////////////////////////////////////////////////////////////////
// Lookup Maps
////////////////////////////////////////////////////////////////////////////////

const FheTypeNameToId: FheTypeNameToIdMap = {
  ebool: 0,
  //euint4: 1, has been deprecated
  euint8: 2,
  euint16: 3,
  euint32: 4,
  euint64: 5,
  euint128: 6,
  eaddress: 7,
  euint256: 8,
} as const;

const FheTypeIdToName: FheTypeIdToNameMap = {
  0: 'ebool',
  //1: 'euint4', has been deprecated
  2: 'euint8',
  3: 'euint16',
  4: 'euint32',
  5: 'euint64',
  6: 'euint128',
  7: 'eaddress',
  8: 'euint256',
} as const;

// TFHE encryption requires a minimum of 2 bits per value.
// Booleans use 2 bits despite only needing 1 bit for the value itself.
const FheTypeIdToEncryptionBitwidth: FheTypeIdToEncryptionBitwidthMap = {
  0: 2,
  //1:?, euint4 has been deprecated
  2: 8,
  3: 16,
  4: 32,
  5: 64,
  6: 128,
  7: 160,
  8: 256,
} as const;

const EncryptionBitwidthToFheTypeId: FheTypeEncryptionBitwidthToIdMap = {
  2: 0,
  //?:1, euint4 has been deprecated
  8: 2,
  16: 3,
  32: 4,
  64: 5,
  128: 6,
  160: 7,
  256: 8,
} as const;

const FheTypeIdToSolidityPrimitiveTypeName: Record<
  FheTypeId,
  SolidityPrimitiveTypeName
> = {
  0: 'bool',
  //1:'uint256', euint4 has been deprecated
  2: 'uint256',
  3: 'uint256',
  4: 'uint256',
  5: 'uint256',
  6: 'uint256',
  7: 'address',
  8: 'uint256',
} as const;

Object.freeze(FheTypeNameToId);
Object.freeze(FheTypeIdToEncryptionBitwidth);
Object.freeze(EncryptionBitwidthToFheTypeId);
Object.freeze(FheTypeIdToSolidityPrimitiveTypeName);

////////////////////////////////////////////////////////////////////////////////
// Type Guards
////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is a valid FheTypeId.
 * @example isFheTypeId(2) // true (euint8)
 * @example isFheTypeId(1) // false (euint4 is deprecated)
 */
export function isFheTypeId(value: unknown): value is FheTypeId {
  // 1: euint4 is deprecated
  switch (value as FheTypeId) {
    case 0:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      return true;
    default:
      return false;
  }
}

/**
 * Checks if a value is a valid FheTypeName.
 * @example isFheTypeName('euint8') // true
 * @example isFheTypeName('euint4') // false (deprecated)
 */
export function isFheTypeName(value: unknown): value is FheTypeName {
  if (typeof value !== 'string') {
    return false;
  }
  return value in FheTypeNameToId;
}

/**
 * Checks if a value is a valid encryption bit width.
 * @example isEncryptionBits(8) // true
 * @example isEncryptionBits(4) // false (euint4 is deprecated)
 */
export function isEncryptionBits(value: unknown): value is EncryptionBits {
  if (typeof value !== 'number') {
    return false;
  }
  return value in EncryptionBitwidthToFheTypeId;
}

/**
 * Asserts that a value is a valid encryption bit width.
 * @throws {InvalidTypeError} If value is not a valid encryption bit width.
 * @example assertIsEncryptionBits(8) // passes
 * @example assertIsEncryptionBits(4) // throws (euint4 is deprecated)
 */
export function assertIsEncryptionBits(
  value: unknown,
  varName?: string,
): asserts value is EncryptionBits {
  if (!isEncryptionBits(value)) {
    throw new InvalidTypeError({
      varName,
      type: typeof value,
      expectedType: 'EncryptionBits',
    });
  }
}

/**
 * Asserts that a value is a valid encryption bit width.
 * @throws {InvalidTypeError} If value is not a valid encryption bit width.
 * @example assertIsEncryptionBits(8) // passes
 * @example assertIsEncryptionBits(4) // throws (euint4 is deprecated)
 */
export function assertIsEncryptionBitsArray(
  value: unknown,
  varName?: string,
): asserts value is EncryptionBits[] {
  if (!Array.isArray(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'EncryptionBitsArray',
    });
  }
  for (let i = 0; i < value.length; ++i) {
    if (!isEncryptionBits(value[i])) {
      throw new InvalidTypeError({
        ...(varName !== undefined
          ? { varName: `${varName}[${i.toString()}]` }
          : {}),
        type: typeof value[i],
        expectedType: 'EncryptionBits',
      });
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// FheTypeId extractors
////////////////////////////////////////////////////////////////////////////////

/**
 * Converts an encryption bit width to its corresponding FheTypeId.
 * Accepts loose `number` input; validates internally via `isEncryptionBits`.
 * @throws {FheTypeError} If bitwidth is not a valid encryption bit width.
 * @example fheTypeIdFromEncryptionBits(8) // 2 (euint8)
 */
export function fheTypeIdFromEncryptionBits(
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  bitwidth: number | EncryptionBits,
): FheTypeId {
  if (!isEncryptionBits(bitwidth)) {
    throw new FheTypeError({
      message: `Invalid encryption bits ${bitwidth}`,
    });
  }
  return EncryptionBitwidthToFheTypeId[bitwidth];
}

/**
 * Converts an FheTypeName to its corresponding FheTypeId.
 * Accepts loose `string` input; validates internally via `isFheTypeName`.
 * @throws {FheTypeError} If name is not a valid FheTypeName.
 * @example fheTypeIdFromName('euint8') // 2
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function fheTypeIdFromName(name: string | FheTypeName): FheTypeId {
  if (!isFheTypeName(name)) {
    throw new FheTypeError({
      message: `Invalid FheType name '${name}'`,
    });
  }
  return FheTypeNameToId[name];
}

/**
 * Converts an FheTypeId to its corresponding FheTypeName.
 * Accepts loose `number` input; validates internally via `isFheTypeId`.
 * @throws {FheTypeError} If id is not a valid FheTypeId.
 * @example fheTypeNameFromId(2) // 'euint8'
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function fheTypeNameFromId(id: number | FheTypeId): FheTypeName {
  if (!isFheTypeId(id)) {
    throw new FheTypeError({
      message: `Invalid FheType id '${id}'`,
    });
  }
  return FheTypeIdToName[id];
}

////////////////////////////////////////////////////////////////////////////////
// Solidity primitive type names
////////////////////////////////////////////////////////////////////////////////

/**
 * Returns the Solidity primitive type name for an FheTypeId.
 * Accepts loose `number` input; validates internally via `isFheTypeId`.
 * @example solidityPrimitiveTypeNameFromFheTypeId(0) // 'bool'
 * @example solidityPrimitiveTypeNameFromFheTypeId(7) // 'address'
 * @example solidityPrimitiveTypeNameFromFheTypeId(2) // 'uint256'
 */
export function solidityPrimitiveTypeNameFromFheTypeId(
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  typeId: number | FheTypeId,
): SolidityPrimitiveTypeName {
  if (!isFheTypeId(typeId)) {
    throw new FheTypeError({
      message: `Invalid FheType id '${typeId}'`,
    });
  }
  return FheTypeIdToSolidityPrimitiveTypeName[typeId];
}

////////////////////////////////////////////////////////////////////////////////
// Encryption Bits
////////////////////////////////////////////////////////////////////////////////

/**
 * Returns the encryption bit width for an FheTypeId.
 * @param typeId - The FHE type Id
 * @returns The encryption bit width (always >= 2)
 * @example encryptionBitsFromFheTypeId(2) // 8 (euint8)
 * @example encryptionBitsFromFheTypeId(7) // 160 (eaddress)
 */
export function encryptionBitsFromFheTypeId(typeId: FheTypeId): EncryptionBits {
  if (!isFheTypeId(typeId)) {
    throw new FheTypeError({
      message: `Invalid FheType id '${typeId}'`,
    });
  }

  const bw = FheTypeIdToEncryptionBitwidth[typeId];

  // Invariant: bit width must be >= 2 (TFHE minimum encryption granularity)
  _assertMinimumEncryptionBitWidth(bw);

  return bw;
}

/**
 * Returns the encryption bit width for an FheType name.
 * @param name - The FHE type name (e.g., 'ebool', 'euint32', 'eaddress')
 * @returns The encryption bit width (always >= 2)
 * @example encryptionBitsFromFheTypeName('ebool') // 2
 * @example encryptionBitsFromFheTypeName('euint32') // 32
 * @example encryptionBitsFromFheTypeName('eaddress') // 160
 */
export function encryptionBitsFromFheTypeName(
  name: FheTypeName,
): EncryptionBits {
  if (!isFheTypeName(name)) {
    throw new FheTypeError({
      message: `Invalid FheType name '${name}'`,
    });
  }

  const bw = FheTypeIdToEncryptionBitwidth[FheTypeNameToId[name]];

  // Invariant: bit width must be >= 2 (TFHE minimum encryption granularity)
  _assertMinimumEncryptionBitWidth(bw);

  return bw;
}

function _assertMinimumEncryptionBitWidth(bw: number): void {
  if (bw < MINIMUM_ENCRYPTION_BIT_WIDTH) {
    throw new FheTypeError({
      message: `Invalid FheType encryption bit width: ${bw}. Minimum encryption bit width is ${MINIMUM_ENCRYPTION_BIT_WIDTH} bits.`,
    });
  }
}
