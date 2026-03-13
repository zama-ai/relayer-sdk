"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FhevmHandleImpl_handleBytes32Hex, _FhevmHandleImpl_handleBytes32;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION = void 0;
exports.assertIsFhevmHandleBytes32Hex = assertIsFhevmHandleBytes32Hex;
exports.assertIsFhevmHandleBytes32 = assertIsFhevmHandleBytes32;
exports.assertIsFhevmHandle = assertIsFhevmHandle;
exports.assertIsExternalFhevmHandle = assertIsExternalFhevmHandle;
exports.assertIsFhevmHandleLike = assertIsFhevmHandleLike;
exports.isFhevmHandleBytes32 = isFhevmHandleBytes32;
exports.isFhevmHandleBytes32Hex = isFhevmHandleBytes32Hex;
exports.isFhevmHandleLike = isFhevmHandleLike;
exports.isFhevmHandle = isFhevmHandle;
exports.isExternalFhevmHandle = isExternalFhevmHandle;
exports.asFhevmHandle = asFhevmHandle;
exports.asFhevmHandleLike = asFhevmHandleLike;
exports.asFhevmHandleBytes32 = asFhevmHandleBytes32;
exports.asFhevmHandleBytes32Hex = asFhevmHandleBytes32Hex;
exports.fhevmHandleBytes32HexToFhevmHandle = fhevmHandleBytes32HexToFhevmHandle;
exports.bytes32HexToFhevmHandle = bytes32HexToFhevmHandle;
exports.bytes32ToFhevmHandle = bytes32ToFhevmHandle;
exports.fhevmHandleLikeToFhevmHandle = fhevmHandleLikeToFhevmHandle;
exports.toFhevmHandle = toFhevmHandle;
exports.toExternalFhevmHandle = toExternalFhevmHandle;
exports.fhevmHandleEquals = fhevmHandleEquals;
exports.assertFhevmHandleArrayEquals = assertFhevmHandleArrayEquals;
exports.buildFhevmHandle = buildFhevmHandle;
exports.assertIsFhevmHandleLikeArray = assertIsFhevmHandleLikeArray;
exports.assertFhevmHandlesBelongToSameChainId = assertFhevmHandlesBelongToSameChainId;
const FhevmHandleError_js_1 = require("../errors/FhevmHandleError.js");
const bytes_js_1 = require("../base/bytes.js");
const FheType_js_1 = require("./FheType.js");
const string_js_1 = require("../base/string.js");
const uint_js_1 = require("../base/uint.js");
const InvalidTypeError_js_1 = require("../base/errors/InvalidTypeError.js");
const PRIVATE_TOKEN = Symbol("FhevmHandle.token");
exports.FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION = 0;
const FHEVM_HANDLE_HASH21_BYTE_OFFSET = 0;
const FHEVM_HANDLE_INDEX_BYTE_OFFSET = 21;
const FHEVM_HANDLE_CHAINID_BYTE_OFFSET = 22;
const FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET = 30;
const FHEVM_HANDLE_VERSION_BYTE_OFFSET = 31;
class FhevmHandleImpl {
    constructor(privateToken, parameters) {
        _FhevmHandleImpl_handleBytes32Hex.set(this, void 0);
        _FhevmHandleImpl_handleBytes32.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _FhevmHandleImpl_handleBytes32Hex, parameters.handleBytes32Hex, "f");
        __classPrivateFieldSet(this, _FhevmHandleImpl_handleBytes32, parameters.handleBytes32, "f");
    }
    get bytes32Hex() {
        return __classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f");
    }
    get bytes32HexNo0x() {
        return (0, string_js_1.remove0x)(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"));
    }
    get bytes32() {
        if (__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32, "f") === undefined) {
            __classPrivateFieldSet(this, _FhevmHandleImpl_handleBytes32, (0, bytes_js_1.hexToBytes32)(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f")), "f");
        }
        return new Uint8Array(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32, "f"));
    }
    get hash21() {
        return (0, bytes_js_1.bytesHexSlice)(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_HASH21_BYTE_OFFSET, 21);
    }
    get chainId() {
        return (0, bytes_js_1.bytesHexUint64At)(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_CHAINID_BYTE_OFFSET);
    }
    get fheTypeId() {
        return (0, bytes_js_1.bytesHexUint8At)(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET);
    }
    get fheType() {
        return (0, FheType_js_1.fheTypeNameFromId)(this.fheTypeId);
    }
    get version() {
        return (0, bytes_js_1.bytesHexUint8At)(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_VERSION_BYTE_OFFSET);
    }
    get isComputed() {
        return this.index === undefined;
    }
    get index() {
        const indexUint8 = (0, bytes_js_1.bytesHexUint8At)(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_INDEX_BYTE_OFFSET);
        return indexUint8 === 255 ? undefined : indexUint8;
    }
    get isExternal() {
        return !this.isComputed;
    }
    get encryptionBits() {
        return (0, FheType_js_1.encryptionBitsFromFheTypeId)(this.fheTypeId);
    }
    get solidityPrimitiveTypeName() {
        return (0, FheType_js_1.solidityPrimitiveTypeNameFromFheTypeId)(this.fheTypeId);
    }
    toString() {
        return __classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f");
    }
    toJson() {
        return __classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f");
    }
}
_FhevmHandleImpl_handleBytes32Hex = new WeakMap(), _FhevmHandleImpl_handleBytes32 = new WeakMap();
function assertIsFhevmHandleBytes32Hex(value, options) {
    if (!(0, bytes_js_1.isBytes32Hex)(value)) {
        throw new FhevmHandleError_js_1.FhevmHandleError({
            ...options,
            message: `FHEVM Handle is not a valid bytes32 hex.`,
        });
    }
    _assertIsFhevmHandleBytes32Hex(value, options);
}
function assertIsFhevmHandleBytes32(value, options) {
    if (!(0, bytes_js_1.isBytes32)(value)) {
        throw new FhevmHandleError_js_1.FhevmHandleError({
            ...options,
            message: `FHEVM Handle is not a valid bytes32.`,
        });
    }
    _assertIsFhevmHandleBytes32(value, options);
}
function assertIsFhevmHandle(value, options) {
    if (!isFhevmHandle(value)) {
        throw new FhevmHandleError_js_1.FhevmHandleError({
            ...options,
            message: `Value is not a valid FhevmHandle.`,
        });
    }
}
function assertIsExternalFhevmHandle(value, options) {
    if (!isExternalFhevmHandle(value)) {
        throw new FhevmHandleError_js_1.FhevmHandleError({
            ...options,
            message: `Value is not a valid ExternalFhevmHandle.`,
        });
    }
}
function assertIsFhevmHandleLike(value, options) {
    if (value instanceof FhevmHandleImpl) {
        return;
    }
    if (value !== null && typeof value === "object" && "bytes32Hex" in value) {
        assertIsFhevmHandleBytes32Hex(value.bytes32Hex, options);
        return;
    }
    if (typeof value === "string") {
        assertIsFhevmHandleBytes32Hex(value, options);
        return;
    }
    assertIsFhevmHandleBytes32(value, options);
}
function isFhevmHandleBytes32(value) {
    try {
        assertIsFhevmHandleBytes32(value);
        return true;
    }
    catch {
        return false;
    }
}
function isFhevmHandleBytes32Hex(value) {
    try {
        assertIsFhevmHandleBytes32Hex(value);
        return true;
    }
    catch {
        return false;
    }
}
function isFhevmHandleLike(value) {
    try {
        assertIsFhevmHandleLike(value);
        return true;
    }
    catch {
        return false;
    }
}
function isFhevmHandle(value) {
    return value instanceof FhevmHandleImpl;
}
function isExternalFhevmHandle(value) {
    return (isFhevmHandle(value) &&
        value.isExternal &&
        value.index !== undefined &&
        !value.isComputed);
}
function asFhevmHandle(value) {
    assertIsFhevmHandle(value);
    return value;
}
function asFhevmHandleLike(value) {
    assertIsFhevmHandleLike(value);
    return value;
}
function asFhevmHandleBytes32(value) {
    assertIsFhevmHandleBytes32(value);
    return value;
}
function asFhevmHandleBytes32Hex(value) {
    assertIsFhevmHandleBytes32Hex(value);
    return value;
}
function fhevmHandleBytes32HexToFhevmHandle(handleBytes32Hex) {
    return new FhevmHandleImpl(PRIVATE_TOKEN, {
        handleBytes32Hex,
    });
}
function bytes32HexToFhevmHandle(handleBytes32Hex) {
    _assertIsFhevmHandleBytes32Hex(handleBytes32Hex);
    return new FhevmHandleImpl(PRIVATE_TOKEN, {
        handleBytes32Hex,
    });
}
function bytes32ToFhevmHandle(bytes) {
    const hex = (0, bytes_js_1.bytes32ToHex)(bytes);
    _assertIsFhevmHandleBytes32(bytes);
    return new FhevmHandleImpl(PRIVATE_TOKEN, {
        handleBytes32Hex: hex,
        handleBytes32: new Uint8Array(bytes),
    });
}
function fhevmHandleLikeToFhevmHandle(fhevmHandleLike) {
    if (fhevmHandleLike instanceof FhevmHandleImpl) {
        return fhevmHandleLike;
    }
    if (typeof fhevmHandleLike === "string") {
        return bytes32HexToFhevmHandle(fhevmHandleLike);
    }
    if ("bytes32Hex" in fhevmHandleLike) {
        return bytes32HexToFhevmHandle(fhevmHandleLike.bytes32Hex);
    }
    return bytes32ToFhevmHandle(fhevmHandleLike);
}
function toFhevmHandle(value) {
    if (value instanceof FhevmHandleImpl) {
        return value;
    }
    if (value !== null && typeof value === "object" && "bytes32Hex" in value) {
        (0, bytes_js_1.assertIsBytes32Hex)(value.bytes32Hex, {});
        return bytes32HexToFhevmHandle(value.bytes32Hex);
    }
    if (typeof value === "string") {
        (0, bytes_js_1.assertIsBytes32Hex)(value, {});
        return bytes32HexToFhevmHandle(value);
    }
    (0, bytes_js_1.assertIsBytes32)(value, {});
    return bytes32ToFhevmHandle(value);
}
function toExternalFhevmHandle(value) {
    if (!isExternalFhevmHandle(value)) {
        throw new FhevmHandleError_js_1.FhevmHandleError({
            message: "Invalid external handle",
        });
    }
    return value;
}
function fhevmHandleEquals(a, b) {
    return a.bytes32Hex === b.bytes32Hex;
}
function assertFhevmHandleArrayEquals(actual, expected, options) {
    const actualTxt = options?.actualName !== undefined ? ` (${options.actualName})` : "";
    const expectedTxt = options?.expectedName !== undefined ? ` (${options.expectedName})` : "";
    if (actual.length !== expected.length) {
        throw new FhevmHandleError_js_1.FhevmHandleError({
            message: `Unexpected handles list sizes: ${actual.length}${actualTxt} != ${expected.length}${expectedTxt}`,
        });
    }
    const expectedHandles = expected.map((h) => toFhevmHandle(h));
    for (let i = 0; i < actual.length; ++i) {
        const a = actual[i];
        const e = expectedHandles[i];
        if (a.bytes32Hex !== e.bytes32Hex) {
            throw new FhevmHandleError_js_1.FhevmHandleError({
                message: `Unexpected handle[${i}]: ${a.bytes32Hex}${actualTxt} != ${e.bytes32Hex}${expectedTxt}`,
            });
        }
    }
}
function buildFhevmHandle({ index, chainId, hash21, fheTypeId, version, }) {
    const theVersion = (0, uint_js_1.asUint8Number)(version ?? exports.FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION);
    const chainId32Bytes = (0, uint_js_1.uint64ToBytes32)(chainId);
    const chainId8Bytes = chainId32Bytes.subarray(24, 32);
    const handleHash21 = (0, bytes_js_1.asBytes21)((0, bytes_js_1.hexToBytes)(hash21));
    const handleBytes32AsBytes = new Uint8Array(32);
    handleBytes32AsBytes.set(handleHash21, 0);
    handleBytes32AsBytes[21] = (0, uint_js_1.asUint8Number)(index ?? 255);
    handleBytes32AsBytes.set(chainId8Bytes, 22);
    handleBytes32AsBytes[30] = fheTypeId;
    handleBytes32AsBytes[31] = theVersion;
    return bytes32ToFhevmHandle(handleBytes32AsBytes);
}
function assertIsFhevmHandleLikeArray(value, options) {
    if (!Array.isArray(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options?.subject,
            type: typeof value,
            expectedType: "FhevmHandleLike[]",
        }, options ?? {});
    }
    for (let i = 0; i < value.length; ++i) {
        if (!isFhevmHandleLike(value[i])) {
            throw new InvalidTypeError_js_1.InvalidTypeError({
                subject: options?.subject,
                index: i,
                type: typeof value[i],
                expectedType: "FhevmHandleLike",
            }, options ?? {});
        }
    }
}
function assertFhevmHandlesBelongToSameChainId(fhevmHandles, chainId) {
    if (fhevmHandles.length === 0) {
        return;
    }
    const theChainId = chainId ?? fhevmHandles[0]?.chainId;
    for (const handle of fhevmHandles) {
        if (handle.chainId !== theChainId) {
            throw new FhevmHandleError_js_1.FhevmHandleError({
                message: `Handle (${handle.bytes32Hex}) has chainId ${handle.chainId}, expected ${chainId}`,
            });
        }
    }
}
function _assertIsValidFhevmHandleFields(fheTypeId, version, options) {
    if (!(0, FheType_js_1.isFheTypeId)(fheTypeId)) {
        throw new FhevmHandleError_js_1.FhevmHandleError({
            ...options,
            message: `FHEVM Handle is invalid. Unknown FheType: ${fheTypeId}`,
        });
    }
    if (version !== exports.FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION) {
        throw new FhevmHandleError_js_1.FhevmHandleError({
            ...options,
            message: `FHEVM Handle is invalid. Unknown version: ${version}`,
        });
    }
}
function _assertIsFhevmHandleBytes32Hex(value, options) {
    _assertIsValidFhevmHandleFields((0, bytes_js_1.bytesHexUint8At)(value, FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET), (0, bytes_js_1.bytesHexUint8At)(value, FHEVM_HANDLE_VERSION_BYTE_OFFSET), options);
}
function _assertIsFhevmHandleBytes32(value, options) {
    _assertIsValidFhevmHandleFields((0, bytes_js_1.bytesUint8At)(value, FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET), (0, bytes_js_1.bytesUint8At)(value, FHEVM_HANDLE_VERSION_BYTE_OFFSET), options);
}
//# sourceMappingURL=FhevmHandle.js.map