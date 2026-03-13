import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
import { assert } from "../base/errors/InternalError.js";
import { assertIsUint, assertIsUintBigInt, assertIsUintNumber, MAX_UINT128, MAX_UINT16, MAX_UINT256, MAX_UINT32, MAX_UINT64, MAX_UINT8, MAX_UINT_FOR_TYPE, } from "../base/uint.js";
import { bigIntToBytesHex, bytesToBigInt } from "../base/bytes.js";
import { asAddress, assertIsAddress } from "../base/address.js";
import { assertNever } from "../base/errors/utils.js";
import { asBoolean } from "../base/boolean.js";
////////////////////////////////////////////////////////////////////////////////
// TFHE encryption requires a minimum of 2 bits per value.
// Booleans use 2 bits despite only needing 1 bit for the value itself.
const MINIMUM_ENCRYPTION_BIT_WIDTH = 2;
////////////////////////////////////////////////////////////////////////////////
// Lookup Maps
////////////////////////////////////////////////////////////////////////////////
const FheTypeNameToId = {
    ebool: 0,
    //euint4: 1, has been deprecated
    euint8: 2,
    euint16: 3,
    euint32: 4,
    euint64: 5,
    euint128: 6,
    eaddress: 7,
    euint256: 8,
};
const FheTypeIdToName = {
    0: "ebool",
    //1: 'euint4', has been deprecated
    2: "euint8",
    3: "euint16",
    4: "euint32",
    5: "euint64",
    6: "euint128",
    7: "eaddress",
    8: "euint256",
};
const ValueTypeNameToFheTypeName = {
    bool: "ebool",
    uint8: "euint8",
    uint16: "euint16",
    uint32: "euint32",
    uint64: "euint64",
    uint128: "euint128",
    uint256: "euint256",
    address: "eaddress",
};
// TFHE encryption requires a minimum of 2 bits per value.
// Booleans use 2 bits despite only needing 1 bit for the value itself.
const FheTypeIdToEncryptionBits = {
    0: 2,
    //1:?, euint4 has been deprecated
    2: 8,
    3: 16,
    4: 32,
    5: 64,
    6: 128,
    7: 160,
    8: 256,
};
const EncryptionBitwidthToFheTypeId = {
    2: 0,
    //?:1, euint4 has been deprecated
    8: 2,
    16: 3,
    32: 4,
    64: 5,
    128: 6,
    160: 7,
    256: 8,
};
const FheTypeIdToSolidityPrimitiveTypeName = {
    0: "bool",
    //1:'uint256', euint4 has been deprecated
    2: "uint256",
    3: "uint256",
    4: "uint256",
    5: "uint256",
    6: "uint256",
    7: "address",
    8: "uint256",
};
const FheTypeToMaxValue = {
    euint8: MAX_UINT8,
    euint16: MAX_UINT16,
    euint32: MAX_UINT32,
    euint64: MAX_UINT64,
    euint128: MAX_UINT128,
    euint256: MAX_UINT256,
};
Object.freeze(FheTypeNameToId);
Object.freeze(FheTypeIdToEncryptionBits);
Object.freeze(EncryptionBitwidthToFheTypeId);
Object.freeze(FheTypeIdToSolidityPrimitiveTypeName);
Object.freeze(FheTypeToMaxValue);
////////////////////////////////////////////////////////////////////////////////
// Type Guards
////////////////////////////////////////////////////////////////////////////////
/**
 * Checks if a value is a valid FheTypeId.
 * @example isFheTypeId(2) // true (euint8)
 * @example isFheTypeId(1) // false (euint4 is deprecated)
 */
export function isFheTypeId(value) {
    if (typeof value !== "number") {
        return false;
    }
    return value in FheTypeIdToName;
}
/**
 * Asserts that a value is a valid FheTypeId.
 * @throws A {@link InvalidTypeError} If value is not a valid FheTypeId.
 * @example assertIsFheTypeId(2) // passes
 * @example assertIsFheTypeId(1) // throws (deprecated)
 */
export function assertIsFheTypeId(value, options) {
    if (!isFheTypeId(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            expectedType: Object.keys(FheTypeIdToName).join("|"),
        }, options);
    }
}
/**
 * Try to cast a value to FheTypeId, throwing if invalid.
 * @throws A {@link InvalidTypeError} If value is not a valid FheTypeId.
 * @example const name = asFheTypeId(2) // 2 as FheTypeId
 * @example const name = asFheTypeId(1) // throws (deprecated)
 */
export function asFheTypeId(value) {
    assertIsFheTypeId(value, {});
    return value;
}
/**
 * Checks if a value is a valid FheType.
 * @example isFheType('euint8') // true
 * @example isFheType('euint4') // false (deprecated)
 */
export function isFheType(value) {
    if (typeof value !== "string") {
        return false;
    }
    return value in FheTypeNameToId;
}
/**
 * Asserts that a value is a valid FheType.
 * @throws A {@link InvalidTypeError} If value is not a valid FheType.
 * @example assertIsFheType('euint8') // passes
 * @example assertIsFheType('euint4') // throws (deprecated)
 */
export function assertIsFheType(value, options) {
    if (!isFheType(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            expectedType: Object.keys(FheTypeNameToId).join("|"),
        }, options);
    }
}
/**
 * Try to cast a value to FheType, throwing if invalid.
 * @throws A {@link InvalidTypeError} If value is not a valid FheType.
 * @example const name = asFheType('euint8') // 'euint8' as FheType
 * @example const name = asFheType('euint4') // throws (deprecated)
 */
export function asFheType(value) {
    assertIsFheType(value, {});
    return value;
}
/**
 * Checks if a value is a valid encryption bit width.
 * @example isEncryptionBits(8) // true
 * @example isEncryptionBits(4) // false (euint4 is deprecated)
 */
export function isEncryptionBits(value) {
    if (typeof value !== "number") {
        return false;
    }
    return value in EncryptionBitwidthToFheTypeId;
}
/**
 * Try to cast a value to EncryptionBits, throwing if invalid.
 * @throws A {@link InvalidTypeError} If value is not a valid encryption bit width.
 * @example const b8 = asEncryptionBits(8) // 8 as EncryptionBits
 * @example const b4 = asEncryptionBits(4) // throws (euint4 is deprecated)
 */
export function asEncryptionBits(value) {
    assertIsEncryptionBits(value, {});
    return value;
}
/**
 * Asserts that a value is a valid encryption bit width.
 * @throws A {@link InvalidTypeError} If value is not a valid encryption bit width.
 * @example assertIsEncryptionBits(8) // passes
 * @example assertIsEncryptionBits(4) // throws (euint4 is deprecated)
 */
export function assertIsEncryptionBits(value, options) {
    if (!isEncryptionBits(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            expectedType: Object.keys(EncryptionBitwidthToFheTypeId).join("|"),
        }, options);
    }
}
/**
 * Asserts that a value is a valid encryption bit width.
 * @throws A {@link InvalidTypeError} If value is not a valid encryption bit width.
 * @example assertIsEncryptionBits(8) // passes
 * @example assertIsEncryptionBits(4) // throws (euint4 is deprecated)
 */
export function assertIsEncryptionBitsArray(value, options) {
    if (!Array.isArray(value)) {
        throw new InvalidTypeError({
            type: typeof value,
            expectedType: "EncryptionBits[]",
        }, options);
    }
    for (let i = 0; i < value.length; ++i) {
        if (!isEncryptionBits(value[i])) {
            throw new InvalidTypeError({
                subject: options.subject,
                index: i,
                type: typeof value[i],
                expectedType: "EncryptionBits",
            }, options);
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
// FheTypeId extractors
////////////////////////////////////////////////////////////////////////////////
/**
 * Converts an encryption bit width to its corresponding FheTypeId.
 * Accepts loose `number` input; validates internally via `isEncryptionBits`.
 * @throws A {@link FheTypeError} If bitwidth is not a valid encryption bit width.
 * @example fheTypeIdFromEncryptionBits(8) // 2 (euint8)
 */
export function fheTypeIdFromEncryptionBits(bitwidth) {
    return EncryptionBitwidthToFheTypeId[bitwidth];
}
/**
 * Converts an FheType to its corresponding FheTypeId.
 * Accepts loose `string` input; validates internally via `isFheType`.
 * @throws A {@link FheTypeError} If name is not a valid FheType.
 * @example fheTypeIdFromName('euint8') // 2
 */
export function fheTypeIdFromName(name) {
    return FheTypeNameToId[name];
}
/**
 * Converts an FheTypeId to its corresponding FheType.
 * @throws A {@link FheTypeError} If id is not a valid FheTypeId.
 * @example fheTypeNameFromId(2) // 'euint8'
 */
export function fheTypeNameFromId(typeId) {
    return FheTypeIdToName[typeId];
}
/**
 * Converts a TypeName to its corresponding FheType.
 * @throws A {@link FheTypeError} If id is not a valid FheTypeId.
 * @example fheTypeNameFromTypeName('uint8') // 'euint8'
 */
export function fheTypeNameFromTypeName(typeName) {
    return ValueTypeNameToFheTypeName[typeName];
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
export function solidityPrimitiveTypeNameFromFheTypeId(typeId) {
    return FheTypeIdToSolidityPrimitiveTypeName[typeId];
}
////////////////////////////////////////////////////////////////////////////////
// Encryption Bits
////////////////////////////////////////////////////////////////////////////////
/**
 * Returns the encryption bit width for an FheTypeId.
 * @param typeId - The FHE type Id
 * @returns The encryption bit width (always \>= 2)
 * @example encryptionBitsFromFheTypeId(2) // 8 (euint8)
 * @example encryptionBitsFromFheTypeId(7) // 160 (eaddress)
 */
export function encryptionBitsFromFheTypeId(typeId) {
    const bw = FheTypeIdToEncryptionBits[typeId];
    // Invariant: bit width must be >= 2 (TFHE minimum encryption granularity)
    _assertMinimumEncryptionBitWidth(bw);
    return bw;
}
/**
 * Returns the encryption bit width for an FheType name.
 * @param name - The FHE type name (e.g., 'ebool', 'euint32', 'eaddress')
 * @returns The encryption bit width (always \>= 2)
 * @example encryptionBitsFromFheTypeName('ebool') // 2
 * @example encryptionBitsFromFheTypeName('euint32') // 32
 * @example encryptionBitsFromFheTypeName('eaddress') // 160
 */
export function encryptionBitsFromFheType(name) {
    const bw = FheTypeIdToEncryptionBits[FheTypeNameToId[name]];
    // Invariant: bit width must be >= 2 (TFHE minimum encryption granularity)
    _assertMinimumEncryptionBitWidth(bw);
    return bw;
}
function _assertMinimumEncryptionBitWidth(bw) {
    assert(bw >= MINIMUM_ENCRYPTION_BIT_WIDTH, `Invalid FheType encryption bit width: ${bw}. Minimum encryption bit width is ${MINIMUM_ENCRYPTION_BIT_WIDTH} bits.`);
}
export function bytesToFheDecryptedValue(fheType, bytes) {
    const bn = bytesToBigInt(bytes);
    // needed to type narrowing
    const ft = fheType;
    switch (ft) {
        case "ebool":
            return (bn !== 0n);
        case "eaddress":
            return asAddress(bigIntToBytesHex(bn, { byteLength: 20 }));
        case "euint8":
        case "euint16":
        case "euint32": {
            assertIsUintBigInt(bn, {
                max: BigInt(FheTypeToMaxValue[ft]),
                subject: "value",
            });
            return Number(bn);
        }
        case "euint64":
        case "euint128":
        case "euint256": {
            assertIsUintBigInt(bn, {
                max: BigInt(FheTypeToMaxValue[ft]),
                subject: "value",
            });
            return bn;
        }
        default:
            return assertNever(ft, `Unknown fheTypeName: ${ft}`);
    }
}
export function asFheDecryptedValue(fheTypeName, value, options) {
    switch (fheTypeName) {
        case "ebool":
            return asBoolean(value, options);
        case "eaddress":
            return asAddress(value, options);
        case "euint8":
        case "euint16":
        case "euint32": {
            assertIsUintNumber(value, {
                ...options,
                max: MAX_UINT_FOR_TYPE[fheTypeName],
            });
            return value;
        }
        case "euint64":
        case "euint128":
        case "euint256": {
            assertIsUintBigInt(value, {
                ...options,
                max: MAX_UINT_FOR_TYPE[fheTypeName],
            });
            return value;
        }
        default:
            return assertNever(fheTypeName, `Unknown fheTypeName: ${fheTypeName}`);
    }
}
export function toDecryptedFheValue(fheTypeName, value, options) {
    switch (fheTypeName) {
        case "ebool":
            return asBoolean(value, options);
        case "eaddress":
            assertIsAddress(value, options ?? {});
            return value;
        case "euint8":
        case "euint16":
        case "euint32": {
            assertIsUint(value, {
                ...options,
                max: MAX_UINT_FOR_TYPE[fheTypeName],
            });
            return Number(value);
        }
        case "euint64":
        case "euint128":
        case "euint256": {
            assertIsUint(value, {
                ...options,
                max: MAX_UINT_FOR_TYPE[fheTypeName],
            });
            return BigInt(value);
        }
        default:
            return assertNever(fheTypeName, `Unknown fheTypeName: ${fheTypeName}`);
    }
}
//# sourceMappingURL=FheType.js.map