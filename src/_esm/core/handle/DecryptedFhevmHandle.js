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
var _DecryptedFhevmHandleImpl_handle, _DecryptedFhevmHandleImpl_value, _DecryptedFhevmHandleImpl_originToken;
import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
import { asFheDecryptedValue } from "./FheType.js";
import { assertNever } from "../base/errors/utils.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("DecryptedFhevmHandle.token");
////////////////////////////////////////////////////////////////////////////////
/**
 * Module-scoped symbol used as the method key for origin verification.
 * Never exported — invisible to IDE autocomplete and external code.
 * @internal
 */
const VERIFY_ORIGIN_FUNC = Symbol("DecryptedFhevmHandle.verifyOrigin");
/**
 * Internal implementation. Not exported — external code cannot instantiate.
 *
 * Security relies on:
 * - Class not being exported (no `new` from outside)
 * - `Object.freeze` on every instance (immutability)
 * - Private fields (`#handle`, `#value`, `#originToken`) inaccessible from outside
 * - `Object.freeze` on prototype (no prototype pollution)
 * - Symbol-keyed `[VERIFY_ORIGIN]` method invisible to IDE and external code
 */
class DecryptedFhevmHandleImpl {
    constructor(privateToken, parameters) {
        _DecryptedFhevmHandleImpl_handle.set(this, void 0);
        _DecryptedFhevmHandleImpl_value.set(this, void 0);
        _DecryptedFhevmHandleImpl_originToken.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _DecryptedFhevmHandleImpl_handle, parameters.handle, "f");
        __classPrivateFieldSet(this, _DecryptedFhevmHandleImpl_value, parameters.value, "f");
        __classPrivateFieldSet(this, _DecryptedFhevmHandleImpl_originToken, parameters.originToken, "f");
    }
    get fheType() {
        return __classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_handle, "f").fheType;
    }
    get handle() {
        return __classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_handle, "f");
    }
    get value() {
        return __classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_value, "f");
    }
    /**
     * Checks that this instance was created with the given origin token.
     * Symbol-keyed — invisible to IDE autocomplete and inaccessible without
     * the module-scoped {@link VERIFY_ORIGIN_FUNC} symbol.
     */
    [(_DecryptedFhevmHandleImpl_handle = new WeakMap(), _DecryptedFhevmHandleImpl_value = new WeakMap(), _DecryptedFhevmHandleImpl_originToken = new WeakMap(), VERIFY_ORIGIN_FUNC)](token) {
        return __classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_originToken, "f") === token;
    }
    /**
     * Safe string representation that does not expose the value.
     */
    toString() {
        return `DecryptedFhevmHandle<${__classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_handle, "f").fheType}>`;
    }
    /**
     * Safe JSON serialization that does not expose the value.
     */
    toJson() {
        return {
            handle: __classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_handle, "f").bytes32Hex,
            fheType: __classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_handle, "f").fheType,
        };
    }
}
Object.freeze(DecryptedFhevmHandleImpl.prototype);
// ============================================================================
// Public API — Guards & Assertions
// ============================================================================
/**
 * Returns `true` if `value` was created via {@link createDecryptedFhevmHandle}
 * and its origin matches the given `originToken`.
 *
 * Uses `instanceof` against the non-exported `DecryptedFhevmHandleImpl` class
 * (unforgeable in same-realm contexts), then verifies the origin token.
 *
 * @param value - The value to check
 * @param originToken - Origin symbol held privately by the decrypt flow
 */
export function isDecryptedFhevmHandle(value, originToken) {
    if (!(value instanceof DecryptedFhevmHandleImpl))
        return false;
    return value[VERIFY_ORIGIN_FUNC](originToken);
}
/**
 * Asserts that `value` was created via {@link createDecryptedFhevmHandle}
 * and its origin matches the given `originToken`.
 *
 * @throws {InvalidTypeError} If the value is not a `DecryptedFhevmHandle`
 * instance, or if it fails origin verification.
 */
export function assertIsDecryptedFhevmHandle(value, options) {
    if (!isDecryptedFhevmHandle(value, options.originToken)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "DecryptedFhevmHandle",
        }, options);
    }
}
/**
 * Returns `true` if every element was created via
 * {@link createDecryptedFhevmHandle} and its origin matches the given
 * `originToken`.
 */
export function isDecryptedFhevmHandleArray(values, originToken) {
    return values.every((v) => isDecryptedFhevmHandle(v, originToken));
}
/**
 * Asserts that `values` is an array where every element was created via
 * {@link createDecryptedFhevmHandle} and its origin matches the given
 * `originToken`.
 *
 * @throws {InvalidTypeError} If the value is not an array, or if any element
 * is not a `DecryptedFhevmHandle` instance (error includes the index).
 */
export function assertIsDecryptedFhevmHandleArray(values, options) {
    if (!Array.isArray(values)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof values,
            expectedType: "DecryptedFhevmHandle[]",
        }, options);
    }
    for (let i = 0; i < values.length; ++i) {
        if (!isDecryptedFhevmHandle(values[i], options.originToken)) {
            throw new InvalidTypeError({
                subject: options.subject,
                index: i,
                type: typeof values[i],
                expectedType: "DecryptedFhevmHandle",
            }, options);
        }
    }
}
// ============================================================================
// Public API — Factory
// ============================================================================
/**
 * Creates a validated, immutable {@link DecryptedFhevmHandleOfTypeBase}.
 *
 * The `originToken` parameter acts as access control: only code that holds
 * a private `Symbol` (e.g. `publicDecrypt`, `userDecrypt`) can produce
 * instances that pass {@link isDecryptedFhevmHandle} with origin verification.
 *
 * @param handle - A validated {@link FhevmHandle}
 * @param value - The decrypted plaintext value (validated against `handle.fheType`)
 * @param originToken - Private symbol owned by the calling decrypt flow
 * @returns A frozen `DecryptedFhevmHandle` instance
 * @throws {InvalidTypeError} If the value doesn't match the handle's FHE type
 */
export function createDecryptedFhevmHandle(handle, value, originToken) {
    const v = new DecryptedFhevmHandleImpl(PRIVATE_TOKEN, {
        handle,
        value: asFheDecryptedValue(handle.fheType, value),
        originToken,
    });
    Object.freeze(v);
    return v;
}
/**
 * Creates an array of {@link DecryptedFhevmHandleOfTypeBase}s from parallel arrays of
 * handles and clear values.
 *
 * @param orderedHandles - Validated FHEVM handles
 * @param orderedClearValues - Corresponding decrypted values (same length & order)
 * @param originToken - Private symbol owned by the calling decrypt flow
 * @returns A frozen array of frozen `DecryptedFhevmHandle` instances
 */
export function createDecryptedFhevmHandleArray(orderedHandles, orderedClearValues, originToken) {
    if (orderedHandles.length !== orderedClearValues.length) {
        throw new InvalidTypeError({
            subject: "orderedClearValues",
            type: `Array(${orderedClearValues.length})`,
            expectedType: `Array(${orderedHandles.length}) — must match orderedHandles length`,
        }, {});
    }
    const result = orderedHandles.map((handle, i) => createDecryptedFhevmHandle(handle, orderedClearValues[i], originToken));
    return Object.freeze(result);
}
function _decryptedFheValueToBigInt(value) {
    if (typeof value === "boolean") {
        return value ? BigInt("0x01") : BigInt("0x00");
    }
    return BigInt(value);
}
export function abiEncodeDecryptedFhevmHandles(fhevm, args) {
    const orderedHandles = args.orderedHandles;
    const abiTypes = [];
    const abiValues = [];
    for (const orderedHandle of orderedHandles) {
        const handleType = orderedHandle.handle.fheTypeId;
        const clearTextValueBigInt = _decryptedFheValueToBigInt(orderedHandle.value);
        //abiTypes.push(fhevmTypeInfo.solidityTypeName);
        abiTypes.push("uint256");
        switch (handleType) {
            // eaddress
            case 7: {
                // string
                abiValues.push(`0x${clearTextValueBigInt.toString(16).padStart(40, "0")}`);
                break;
            }
            // ebool
            case 0: {
                // bigint (0 or 1)
                if (clearTextValueBigInt !== BigInt(0) &&
                    clearTextValueBigInt !== BigInt(1)) {
                    throw new Error(`Invalid ebool clear text value ${clearTextValueBigInt}. Expecting 0 or 1.`);
                }
                abiValues.push(clearTextValueBigInt);
                break;
            }
            case 2: //euint8
            case 3: //euint16
            case 4: //euint32
            case 5: //euint64
            case 6: //euint128
            case 8: {
                //euint256
                // bigint
                abiValues.push(clearTextValueBigInt);
                break;
            }
            default: {
                assertNever(handleType, `Unsupported Fhevm primitive type id: ${handleType}`);
            }
        }
    }
    // ABI encode the decryptedResult as done in the KMS, since all decrypted values
    // are native static types, thay have same abi-encoding as uint256:
    const abiEncodedClearValues = fhevm.runtime.ethereum.encode({
        types: abiTypes,
        values: abiValues,
    });
    return {
        abiTypes,
        abiValues,
        abiEncodedClearValues,
    };
}
//# sourceMappingURL=DecryptedFhevmHandle.js.map