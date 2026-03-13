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
import { FhevmHandleError } from "../errors/FhevmHandleError.js";
import { asBytes21, assertIsBytes32, assertIsBytes32Hex, bytes32ToHex, bytesHexSlice, bytesHexUint64At, bytesHexUint8At, bytesUint8At, hexToBytes, hexToBytes32, isBytes32, isBytes32Hex, } from "../base/bytes.js";
import { encryptionBitsFromFheTypeId, fheTypeNameFromId, isFheTypeId, solidityPrimitiveTypeNameFromFheTypeId, } from "./FheType.js";
import { remove0x } from "../base/string.js";
import { asUint8Number, uint64ToBytes32 } from "../base/uint.js";
import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("FhevmHandle.token");
////////////////////////////////////////////////////////////////////////////////
export const FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION = 0;
////////////////////////////////////////////////////////////////////////////////
const FHEVM_HANDLE_HASH21_BYTE_OFFSET = 0;
const FHEVM_HANDLE_INDEX_BYTE_OFFSET = 21;
const FHEVM_HANDLE_CHAINID_BYTE_OFFSET = 22;
const FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET = 30;
const FHEVM_HANDLE_VERSION_BYTE_OFFSET = 31;
////////////////////////////////////////////////////////////////////////////////
// FhevmHandle
////////////////////////////////////////////////////////////////////////////////
class FhevmHandleImpl {
    constructor(privateToken, parameters) {
        //////////////////////////////////////////////////////////////////////////////
        // Instance Properties
        //////////////////////////////////////////////////////////////////////////////
        _FhevmHandleImpl_handleBytes32Hex.set(this, void 0);
        _FhevmHandleImpl_handleBytes32.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _FhevmHandleImpl_handleBytes32Hex, parameters.handleBytes32Hex, "f");
        __classPrivateFieldSet(this, _FhevmHandleImpl_handleBytes32, parameters.handleBytes32, "f"); // takes ownership, no copy
    }
    //////////////////////////////////////////////////////////////////////////////
    // Instance Getters
    //////////////////////////////////////////////////////////////////////////////
    get bytes32Hex() {
        return __classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f");
    }
    get bytes32HexNo0x() {
        return remove0x(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"));
    }
    get bytes32() {
        if (__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32, "f") === undefined) {
            __classPrivateFieldSet(this, _FhevmHandleImpl_handleBytes32, hexToBytes32(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f")), "f");
        }
        return new Uint8Array(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32, "f"));
    }
    get hash21() {
        // Extract hash21 (bytes 0-20)
        return bytesHexSlice(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_HASH21_BYTE_OFFSET, 21);
    }
    get chainId() {
        // Extract chainId (bytes 22-29, 8 bytes as big-endian uint64)
        return bytesHexUint64At(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_CHAINID_BYTE_OFFSET);
    }
    get fheTypeId() {
        // Extract fheTypeId (byte 30)
        return bytesHexUint8At(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET);
    }
    get fheType() {
        return fheTypeNameFromId(this.fheTypeId);
    }
    get version() {
        // Extract version (byte 31)
        return bytesHexUint8At(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_VERSION_BYTE_OFFSET);
    }
    get isComputed() {
        return this.index === undefined;
    }
    get index() {
        // Extract index (byte 21) - 255 means computed
        const indexUint8 = bytesHexUint8At(__classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f"), FHEVM_HANDLE_INDEX_BYTE_OFFSET);
        return indexUint8 === 255 /* computed */ ? undefined : indexUint8;
    }
    get isExternal() {
        return !this.isComputed;
    }
    get encryptionBits() {
        return encryptionBitsFromFheTypeId(this.fheTypeId);
    }
    get solidityPrimitiveTypeName() {
        return solidityPrimitiveTypeNameFromFheTypeId(this.fheTypeId);
    }
    toString() {
        return __classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f");
    }
    toJson() {
        return __classPrivateFieldGet(this, _FhevmHandleImpl_handleBytes32Hex, "f");
    }
}
_FhevmHandleImpl_handleBytes32Hex = new WeakMap(), _FhevmHandleImpl_handleBytes32 = new WeakMap();
////////////////////////////////////////////////////////////////////////////////
export function assertIsFhevmHandleBytes32Hex(value, options) {
    if (!isBytes32Hex(value)) {
        throw new FhevmHandleError({
            ...options,
            message: `FHEVM Handle is not a valid bytes32 hex.`,
        });
    }
    _assertIsFhevmHandleBytes32Hex(value, options);
}
export function assertIsFhevmHandleBytes32(value, options) {
    if (!isBytes32(value)) {
        throw new FhevmHandleError({
            ...options,
            message: `FHEVM Handle is not a valid bytes32.`,
        });
    }
    _assertIsFhevmHandleBytes32(value, options);
}
export function assertIsFhevmHandle(value, options) {
    if (!isFhevmHandle(value)) {
        throw new FhevmHandleError({
            ...options,
            message: `Value is not a valid FhevmHandle.`,
        });
    }
}
export function assertIsExternalFhevmHandle(value, options) {
    if (!isExternalFhevmHandle(value)) {
        throw new FhevmHandleError({
            ...options,
            message: `Value is not a valid ExternalFhevmHandle.`,
        });
    }
}
export function assertIsFhevmHandleLike(value, options) {
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
////////////////////////////////////////////////////////////////////////////////
export function isFhevmHandleBytes32(value) {
    try {
        assertIsFhevmHandleBytes32(value);
        return true;
    }
    catch {
        return false;
    }
}
export function isFhevmHandleBytes32Hex(value) {
    try {
        assertIsFhevmHandleBytes32Hex(value);
        return true;
    }
    catch {
        return false;
    }
}
export function isFhevmHandleLike(value) {
    try {
        assertIsFhevmHandleLike(value);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Checks if a value is a `FhevmHandle` instance.
 *
 * **Same-realm only**: Uses `instanceof` which only works when the value
 * was created in the same JavaScript realm (same module instance).
 * Will return `false` for handles from:
 * - Different package versions (duplicate node_modules)
 * - Different bundler outputs
 * - Cross-realm contexts (iframes, workers)
 *
 * @param value - The value to check
 * @returns `true` if value is a `FhevmHandle` instance from the same realm
 */
export function isFhevmHandle(value) {
    return value instanceof FhevmHandleImpl;
}
export function isExternalFhevmHandle(value) {
    return (isFhevmHandle(value) &&
        value.isExternal &&
        value.index !== undefined &&
        !value.isComputed);
}
////////////////////////////////////////////////////////////////////////////////
export function asFhevmHandle(value) {
    assertIsFhevmHandle(value);
    return value;
}
export function asFhevmHandleLike(value) {
    assertIsFhevmHandleLike(value);
    return value;
}
export function asFhevmHandleBytes32(value) {
    assertIsFhevmHandleBytes32(value);
    return value;
}
export function asFhevmHandleBytes32Hex(value) {
    assertIsFhevmHandleBytes32Hex(value);
    return value;
}
/**
 * [Trusted] Converts a `FhevmHandleBytes32Hex` to a `FhevmHandle`.
 *
 * Trusts the type system for FhevmHandle hex format validation.
 *
 * @param handleBytes32Hex - A valid 32-byte hex string (typed as `FhevmHandleBytes32Hex`)
 * @returns A `FhevmHandle` instance
 */
export function fhevmHandleBytes32HexToFhevmHandle(handleBytes32Hex) {
    return new FhevmHandleImpl(PRIVATE_TOKEN, {
        handleBytes32Hex,
    });
}
/**
 * [Trusted] Converts a `Bytes32Hex` to a `FhevmHandle`.
 *
 * Trusts the type system for hex format validation.
 * Still validates FHEVM-specific fields (fheTypeId, version).
 *
 * @param handleBytes32Hex - A valid 32-byte hex string (typed as `Bytes32Hex`)
 * @returns A `FhevmHandle` instance
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export function bytes32HexToFhevmHandle(handleBytes32Hex) {
    _assertIsFhevmHandleBytes32Hex(handleBytes32Hex);
    return new FhevmHandleImpl(PRIVATE_TOKEN, {
        handleBytes32Hex,
    });
}
/**
 * [Trusted] Converts a `Bytes32` to a `FhevmHandle`.
 *
 * Trusts the type system for bytes format validation.
 * Still validates FHEVM-specific fields (fheTypeId, version).
 *
 * @param bytes - A valid 32-byte array (typed as `Bytes32`)
 * @returns A `FhevmHandle` instance
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export function bytes32ToFhevmHandle(bytes) {
    // bytes is validated as a Bytes32
    const hex = bytes32ToHex(bytes);
    _assertIsFhevmHandleBytes32(bytes);
    return new FhevmHandleImpl(PRIVATE_TOKEN, {
        handleBytes32Hex: hex,
        handleBytes32: new Uint8Array(bytes),
    });
}
/**
 * [Trusted] Converts a `FhevmHandleLike` to a `FhevmHandle`.
 *
 * Trusts the type system for input validation.
 * Still validates FHEVM-specific fields (fheTypeId, version).
 *
 * @param fhevmHandleLike - A `FhevmHandleLike` (Bytes32, Bytes32Hex, Bytes32HexAble, or FhevmHandle)
 * @returns A `FhevmHandle` instance
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export function fhevmHandleLikeToFhevmHandle(fhevmHandleLike) {
    // Already a FhevmHandle
    if (fhevmHandleLike instanceof FhevmHandleImpl) {
        return fhevmHandleLike;
    }
    // Bytes32Hex (string)
    if (typeof fhevmHandleLike === "string") {
        return bytes32HexToFhevmHandle(fhevmHandleLike);
    }
    // Bytes32HexAble (object with bytes32Hex property)
    if ("bytes32Hex" in fhevmHandleLike) {
        return bytes32HexToFhevmHandle(fhevmHandleLike.bytes32Hex);
    }
    // Bytes32 (Uint8Array)
    return bytes32ToFhevmHandle(fhevmHandleLike);
}
////////////////////////////////////////////////////////////////////////////////
// Conversion
////////////////////////////////////////////////////////////////////////////////
/**
 * [Validated] Converts an unknown value to a `FhevmHandle`.
 *
 * Performs full runtime validation of input format and FHEVM-specific fields.
 *
 * @param value - An unknown value (string, Uint8Array, or object with bytes32Hex)
 * @returns A `FhevmHandle` instance
 * @throws A `InvalidTypeError` If value is not a valid bytes32 hex or bytes32
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export function toFhevmHandle(value) {
    if (value instanceof FhevmHandleImpl) {
        return value;
    }
    // Object with bytes32Hex property (FhevmHandle-like)
    if (value !== null && typeof value === "object" && "bytes32Hex" in value) {
        assertIsBytes32Hex(value.bytes32Hex, {});
        return bytes32HexToFhevmHandle(value.bytes32Hex);
    }
    if (typeof value === "string") {
        assertIsBytes32Hex(value, {});
        return bytes32HexToFhevmHandle(value);
    }
    assertIsBytes32(value, {});
    return bytes32ToFhevmHandle(value);
}
export function toExternalFhevmHandle(value) {
    if (!isExternalFhevmHandle(value)) {
        throw new FhevmHandleError({
            message: "Invalid external handle",
        });
    }
    return value;
}
/**
 * [Trusted] Compares two `FhevmHandle` instances for equality.
 *
 * @param a - First handle
 * @param b - Second handle
 * @returns `true` if both handles have the same `bytes32Hex` value
 */
export function fhevmHandleEquals(a, b) {
    return a.bytes32Hex === b.bytes32Hex;
}
export function assertFhevmHandleArrayEquals(actual, expected, options) {
    const actualTxt = options?.actualName !== undefined ? ` (${options.actualName})` : "";
    const expectedTxt = options?.expectedName !== undefined ? ` (${options.expectedName})` : "";
    if (actual.length !== expected.length) {
        throw new FhevmHandleError({
            message: `Unexpected handles list sizes: ${actual.length}${actualTxt} != ${expected.length}${expectedTxt}`,
        });
    }
    const expectedHandles = expected.map((h) => toFhevmHandle(h));
    for (let i = 0; i < actual.length; ++i) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const a = actual[i];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const e = expectedHandles[i];
        if (a.bytes32Hex !== e.bytes32Hex) {
            throw new FhevmHandleError({
                message: `Unexpected handle[${i}]: ${a.bytes32Hex}${actualTxt} != ${e.bytes32Hex}${expectedTxt}`,
            });
        }
    }
}
export function buildFhevmHandle({ index, chainId, hash21, fheTypeId, version, }) {
    const theVersion = asUint8Number(version ?? FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION);
    const chainId32Bytes = uint64ToBytes32(chainId);
    const chainId8Bytes = chainId32Bytes.subarray(24, 32);
    const handleHash21 = asBytes21(hexToBytes(hash21));
    const handleBytes32AsBytes = new Uint8Array(32);
    handleBytes32AsBytes.set(handleHash21, 0);
    handleBytes32AsBytes[21] = asUint8Number(index ?? 255);
    handleBytes32AsBytes.set(chainId8Bytes, 22);
    handleBytes32AsBytes[30] = fheTypeId;
    handleBytes32AsBytes[31] = theVersion;
    return bytes32ToFhevmHandle(handleBytes32AsBytes);
}
export function assertIsFhevmHandleLikeArray(value, options) {
    if (!Array.isArray(value)) {
        throw new InvalidTypeError({
            subject: options?.subject,
            type: typeof value,
            expectedType: "FhevmHandleLike[]",
        }, options ?? {});
    }
    for (let i = 0; i < value.length; ++i) {
        if (!isFhevmHandleLike(value[i])) {
            throw new InvalidTypeError({
                subject: options?.subject,
                index: i,
                type: typeof value[i],
                expectedType: "FhevmHandleLike",
            }, options ?? {});
        }
    }
}
export function assertFhevmHandlesBelongToSameChainId(fhevmHandles, chainId) {
    if (fhevmHandles.length === 0) {
        return;
    }
    const theChainId = chainId ?? fhevmHandles[0]?.chainId;
    for (const handle of fhevmHandles) {
        if (handle.chainId !== theChainId) {
            throw new FhevmHandleError({
                message: `Handle (${handle.bytes32Hex}) has chainId ${handle.chainId}, expected ${chainId}`,
            });
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////
function _assertIsValidFhevmHandleFields(fheTypeId, version, options) {
    if (!isFheTypeId(fheTypeId)) {
        throw new FhevmHandleError({
            ...options,
            message: `FHEVM Handle is invalid. Unknown FheType: ${fheTypeId}`,
        });
    }
    if (version !== FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION) {
        throw new FhevmHandleError({
            ...options,
            message: `FHEVM Handle is invalid. Unknown version: ${version}`,
        });
    }
}
function _assertIsFhevmHandleBytes32Hex(value, options) {
    _assertIsValidFhevmHandleFields(bytesHexUint8At(value, FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET), bytesHexUint8At(value, FHEVM_HANDLE_VERSION_BYTE_OFFSET), options);
}
function _assertIsFhevmHandleBytes32(value, options) {
    _assertIsValidFhevmHandleFields(bytesUint8At(value, FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET), bytesUint8At(value, FHEVM_HANDLE_VERSION_BYTE_OFFSET), options);
}
//# sourceMappingURL=FhevmHandle.js.map