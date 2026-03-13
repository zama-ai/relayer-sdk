import type { EncryptionBits, FheType, FheTypeId, SolidityPrimitiveTypeName } from "../types/fheType.js";
import type { Bytes } from "../types/primitives.js";
import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { ValueTypeName } from "../types/primitives.js";
import type { DecryptedFheValueMap } from "../types/decryptedFheValue.js";
/**
 * Checks if a value is a valid FheTypeId.
 * @example isFheTypeId(2) // true (euint8)
 * @example isFheTypeId(1) // false (euint4 is deprecated)
 */
export declare function isFheTypeId(value: unknown): value is FheTypeId;
/**
 * Asserts that a value is a valid FheTypeId.
 * @throws A {@link InvalidTypeError} If value is not a valid FheTypeId.
 * @example assertIsFheTypeId(2) // passes
 * @example assertIsFheTypeId(1) // throws (deprecated)
 */
export declare function assertIsFheTypeId(value: unknown, options: ErrorMetadataParams & {
    subject?: string;
}): asserts value is FheTypeId;
/**
 * Try to cast a value to FheTypeId, throwing if invalid.
 * @throws A {@link InvalidTypeError} If value is not a valid FheTypeId.
 * @example const name = asFheTypeId(2) // 2 as FheTypeId
 * @example const name = asFheTypeId(1) // throws (deprecated)
 */
export declare function asFheTypeId(value: unknown): FheTypeId;
/**
 * Checks if a value is a valid FheType.
 * @example isFheType('euint8') // true
 * @example isFheType('euint4') // false (deprecated)
 */
export declare function isFheType(value: unknown): value is FheType;
/**
 * Asserts that a value is a valid FheType.
 * @throws A {@link InvalidTypeError} If value is not a valid FheType.
 * @example assertIsFheType('euint8') // passes
 * @example assertIsFheType('euint4') // throws (deprecated)
 */
export declare function assertIsFheType(value: unknown, options: ErrorMetadataParams & {
    subject?: string;
}): asserts value is FheType;
/**
 * Try to cast a value to FheType, throwing if invalid.
 * @throws A {@link InvalidTypeError} If value is not a valid FheType.
 * @example const name = asFheType('euint8') // 'euint8' as FheType
 * @example const name = asFheType('euint4') // throws (deprecated)
 */
export declare function asFheType(value: unknown): FheType;
/**
 * Checks if a value is a valid encryption bit width.
 * @example isEncryptionBits(8) // true
 * @example isEncryptionBits(4) // false (euint4 is deprecated)
 */
export declare function isEncryptionBits(value: unknown): value is EncryptionBits;
/**
 * Try to cast a value to EncryptionBits, throwing if invalid.
 * @throws A {@link InvalidTypeError} If value is not a valid encryption bit width.
 * @example const b8 = asEncryptionBits(8) // 8 as EncryptionBits
 * @example const b4 = asEncryptionBits(4) // throws (euint4 is deprecated)
 */
export declare function asEncryptionBits(value: unknown): EncryptionBits;
/**
 * Asserts that a value is a valid encryption bit width.
 * @throws A {@link InvalidTypeError} If value is not a valid encryption bit width.
 * @example assertIsEncryptionBits(8) // passes
 * @example assertIsEncryptionBits(4) // throws (euint4 is deprecated)
 */
export declare function assertIsEncryptionBits(value: unknown, options: ErrorMetadataParams & {
    subject?: string;
}): asserts value is EncryptionBits;
/**
 * Asserts that a value is a valid encryption bit width.
 * @throws A {@link InvalidTypeError} If value is not a valid encryption bit width.
 * @example assertIsEncryptionBits(8) // passes
 * @example assertIsEncryptionBits(4) // throws (euint4 is deprecated)
 */
export declare function assertIsEncryptionBitsArray(value: unknown, options: ErrorMetadataParams & {
    subject?: string;
}): asserts value is EncryptionBits[];
/**
 * Converts an encryption bit width to its corresponding FheTypeId.
 * Accepts loose `number` input; validates internally via `isEncryptionBits`.
 * @throws A {@link FheTypeError} If bitwidth is not a valid encryption bit width.
 * @example fheTypeIdFromEncryptionBits(8) // 2 (euint8)
 */
export declare function fheTypeIdFromEncryptionBits(bitwidth: EncryptionBits): FheTypeId;
/**
 * Converts an FheType to its corresponding FheTypeId.
 * Accepts loose `string` input; validates internally via `isFheType`.
 * @throws A {@link FheTypeError} If name is not a valid FheType.
 * @example fheTypeIdFromName('euint8') // 2
 */
export declare function fheTypeIdFromName(name: FheType): FheTypeId;
/**
 * Converts an FheTypeId to its corresponding FheType.
 * @throws A {@link FheTypeError} If id is not a valid FheTypeId.
 * @example fheTypeNameFromId(2) // 'euint8'
 */
export declare function fheTypeNameFromId(typeId: FheTypeId): FheType;
/**
 * Converts a TypeName to its corresponding FheType.
 * @throws A {@link FheTypeError} If id is not a valid FheTypeId.
 * @example fheTypeNameFromTypeName('uint8') // 'euint8'
 */
export declare function fheTypeNameFromTypeName(typeName: ValueTypeName): FheType;
/**
 * Returns the Solidity primitive type name for an FheTypeId.
 * Accepts loose `number` input; validates internally via `isFheTypeId`.
 * @example solidityPrimitiveTypeNameFromFheTypeId(0) // 'bool'
 * @example solidityPrimitiveTypeNameFromFheTypeId(7) // 'address'
 * @example solidityPrimitiveTypeNameFromFheTypeId(2) // 'uint256'
 */
export declare function solidityPrimitiveTypeNameFromFheTypeId(typeId: FheTypeId): SolidityPrimitiveTypeName;
/**
 * Returns the encryption bit width for an FheTypeId.
 * @param typeId - The FHE type Id
 * @returns The encryption bit width (always \>= 2)
 * @example encryptionBitsFromFheTypeId(2) // 8 (euint8)
 * @example encryptionBitsFromFheTypeId(7) // 160 (eaddress)
 */
export declare function encryptionBitsFromFheTypeId(typeId: FheTypeId): EncryptionBits;
/**
 * Returns the encryption bit width for an FheType name.
 * @param name - The FHE type name (e.g., 'ebool', 'euint32', 'eaddress')
 * @returns The encryption bit width (always \>= 2)
 * @example encryptionBitsFromFheTypeName('ebool') // 2
 * @example encryptionBitsFromFheTypeName('euint32') // 32
 * @example encryptionBitsFromFheTypeName('eaddress') // 160
 */
export declare function encryptionBitsFromFheType(name: FheType): EncryptionBits;
export declare function bytesToFheDecryptedValue<T extends FheType>(fheType: T, bytes: Bytes): DecryptedFheValueMap[T];
export declare function asFheDecryptedValue<T extends FheType>(fheTypeName: T, value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): DecryptedFheValueMap[T];
export declare function toDecryptedFheValue<T extends FheType>(fheTypeName: T, value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): DecryptedFheValueMap[T];
//# sourceMappingURL=FheType.d.ts.map