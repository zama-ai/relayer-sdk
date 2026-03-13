"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFheTypeId = isFheTypeId;
exports.assertIsFheTypeId = assertIsFheTypeId;
exports.asFheTypeId = asFheTypeId;
exports.isFheType = isFheType;
exports.assertIsFheType = assertIsFheType;
exports.asFheType = asFheType;
exports.isEncryptionBits = isEncryptionBits;
exports.asEncryptionBits = asEncryptionBits;
exports.assertIsEncryptionBits = assertIsEncryptionBits;
exports.assertIsEncryptionBitsArray = assertIsEncryptionBitsArray;
exports.fheTypeIdFromEncryptionBits = fheTypeIdFromEncryptionBits;
exports.fheTypeIdFromName = fheTypeIdFromName;
exports.fheTypeNameFromId = fheTypeNameFromId;
exports.fheTypeNameFromTypeName = fheTypeNameFromTypeName;
exports.solidityPrimitiveTypeNameFromFheTypeId = solidityPrimitiveTypeNameFromFheTypeId;
exports.encryptionBitsFromFheTypeId = encryptionBitsFromFheTypeId;
exports.encryptionBitsFromFheType = encryptionBitsFromFheType;
exports.bytesToFheDecryptedValue = bytesToFheDecryptedValue;
exports.asFheDecryptedValue = asFheDecryptedValue;
exports.toDecryptedFheValue = toDecryptedFheValue;
const InvalidTypeError_js_1 = require("../base/errors/InvalidTypeError.js");
const InternalError_js_1 = require("../base/errors/InternalError.js");
const uint_js_1 = require("../base/uint.js");
const bytes_js_1 = require("../base/bytes.js");
const address_js_1 = require("../base/address.js");
const utils_js_1 = require("../base/errors/utils.js");
const boolean_js_1 = require("../base/boolean.js");
const MINIMUM_ENCRYPTION_BIT_WIDTH = 2;
const FheTypeNameToId = {
    ebool: 0,
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
const FheTypeIdToEncryptionBits = {
    0: 2,
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
    2: "uint256",
    3: "uint256",
    4: "uint256",
    5: "uint256",
    6: "uint256",
    7: "address",
    8: "uint256",
};
const FheTypeToMaxValue = {
    euint8: uint_js_1.MAX_UINT8,
    euint16: uint_js_1.MAX_UINT16,
    euint32: uint_js_1.MAX_UINT32,
    euint64: uint_js_1.MAX_UINT64,
    euint128: uint_js_1.MAX_UINT128,
    euint256: uint_js_1.MAX_UINT256,
};
Object.freeze(FheTypeNameToId);
Object.freeze(FheTypeIdToEncryptionBits);
Object.freeze(EncryptionBitwidthToFheTypeId);
Object.freeze(FheTypeIdToSolidityPrimitiveTypeName);
Object.freeze(FheTypeToMaxValue);
function isFheTypeId(value) {
    if (typeof value !== "number") {
        return false;
    }
    return value in FheTypeIdToName;
}
function assertIsFheTypeId(value, options) {
    if (!isFheTypeId(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            expectedType: Object.keys(FheTypeIdToName).join("|"),
        }, options);
    }
}
function asFheTypeId(value) {
    assertIsFheTypeId(value, {});
    return value;
}
function isFheType(value) {
    if (typeof value !== "string") {
        return false;
    }
    return value in FheTypeNameToId;
}
function assertIsFheType(value, options) {
    if (!isFheType(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            expectedType: Object.keys(FheTypeNameToId).join("|"),
        }, options);
    }
}
function asFheType(value) {
    assertIsFheType(value, {});
    return value;
}
function isEncryptionBits(value) {
    if (typeof value !== "number") {
        return false;
    }
    return value in EncryptionBitwidthToFheTypeId;
}
function asEncryptionBits(value) {
    assertIsEncryptionBits(value, {});
    return value;
}
function assertIsEncryptionBits(value, options) {
    if (!isEncryptionBits(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            expectedType: Object.keys(EncryptionBitwidthToFheTypeId).join("|"),
        }, options);
    }
}
function assertIsEncryptionBitsArray(value, options) {
    if (!Array.isArray(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            type: typeof value,
            expectedType: "EncryptionBits[]",
        }, options);
    }
    for (let i = 0; i < value.length; ++i) {
        if (!isEncryptionBits(value[i])) {
            throw new InvalidTypeError_js_1.InvalidTypeError({
                subject: options.subject,
                index: i,
                type: typeof value[i],
                expectedType: "EncryptionBits",
            }, options);
        }
    }
}
function fheTypeIdFromEncryptionBits(bitwidth) {
    return EncryptionBitwidthToFheTypeId[bitwidth];
}
function fheTypeIdFromName(name) {
    return FheTypeNameToId[name];
}
function fheTypeNameFromId(typeId) {
    return FheTypeIdToName[typeId];
}
function fheTypeNameFromTypeName(typeName) {
    return ValueTypeNameToFheTypeName[typeName];
}
function solidityPrimitiveTypeNameFromFheTypeId(typeId) {
    return FheTypeIdToSolidityPrimitiveTypeName[typeId];
}
function encryptionBitsFromFheTypeId(typeId) {
    const bw = FheTypeIdToEncryptionBits[typeId];
    _assertMinimumEncryptionBitWidth(bw);
    return bw;
}
function encryptionBitsFromFheType(name) {
    const bw = FheTypeIdToEncryptionBits[FheTypeNameToId[name]];
    _assertMinimumEncryptionBitWidth(bw);
    return bw;
}
function _assertMinimumEncryptionBitWidth(bw) {
    (0, InternalError_js_1.assert)(bw >= MINIMUM_ENCRYPTION_BIT_WIDTH, `Invalid FheType encryption bit width: ${bw}. Minimum encryption bit width is ${MINIMUM_ENCRYPTION_BIT_WIDTH} bits.`);
}
function bytesToFheDecryptedValue(fheType, bytes) {
    const bn = (0, bytes_js_1.bytesToBigInt)(bytes);
    const ft = fheType;
    switch (ft) {
        case "ebool":
            return (bn !== 0n);
        case "eaddress":
            return (0, address_js_1.asAddress)((0, bytes_js_1.bigIntToBytesHex)(bn, { byteLength: 20 }));
        case "euint8":
        case "euint16":
        case "euint32": {
            (0, uint_js_1.assertIsUintBigInt)(bn, {
                max: BigInt(FheTypeToMaxValue[ft]),
                subject: "value",
            });
            return Number(bn);
        }
        case "euint64":
        case "euint128":
        case "euint256": {
            (0, uint_js_1.assertIsUintBigInt)(bn, {
                max: BigInt(FheTypeToMaxValue[ft]),
                subject: "value",
            });
            return bn;
        }
        default:
            return (0, utils_js_1.assertNever)(ft, `Unknown fheTypeName: ${ft}`);
    }
}
function asFheDecryptedValue(fheTypeName, value, options) {
    switch (fheTypeName) {
        case "ebool":
            return (0, boolean_js_1.asBoolean)(value, options);
        case "eaddress":
            return (0, address_js_1.asAddress)(value, options);
        case "euint8":
        case "euint16":
        case "euint32": {
            (0, uint_js_1.assertIsUintNumber)(value, {
                ...options,
                max: uint_js_1.MAX_UINT_FOR_TYPE[fheTypeName],
            });
            return value;
        }
        case "euint64":
        case "euint128":
        case "euint256": {
            (0, uint_js_1.assertIsUintBigInt)(value, {
                ...options,
                max: uint_js_1.MAX_UINT_FOR_TYPE[fheTypeName],
            });
            return value;
        }
        default:
            return (0, utils_js_1.assertNever)(fheTypeName, `Unknown fheTypeName: ${fheTypeName}`);
    }
}
function toDecryptedFheValue(fheTypeName, value, options) {
    switch (fheTypeName) {
        case "ebool":
            return (0, boolean_js_1.asBoolean)(value, options);
        case "eaddress":
            (0, address_js_1.assertIsAddress)(value, options ?? {});
            return value;
        case "euint8":
        case "euint16":
        case "euint32": {
            (0, uint_js_1.assertIsUint)(value, {
                ...options,
                max: uint_js_1.MAX_UINT_FOR_TYPE[fheTypeName],
            });
            return Number(value);
        }
        case "euint64":
        case "euint128":
        case "euint256": {
            (0, uint_js_1.assertIsUint)(value, {
                ...options,
                max: uint_js_1.MAX_UINT_FOR_TYPE[fheTypeName],
            });
            return BigInt(value);
        }
        default:
            return (0, utils_js_1.assertNever)(fheTypeName, `Unknown fheTypeName: ${fheTypeName}`);
    }
}
//# sourceMappingURL=FheType.js.map