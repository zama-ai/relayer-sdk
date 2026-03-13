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
var _DecryptedFhevmHandleImpl_handle, _DecryptedFhevmHandleImpl_value, _DecryptedFhevmHandleImpl_originToken;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDecryptedFhevmHandle = isDecryptedFhevmHandle;
exports.assertIsDecryptedFhevmHandle = assertIsDecryptedFhevmHandle;
exports.isDecryptedFhevmHandleArray = isDecryptedFhevmHandleArray;
exports.assertIsDecryptedFhevmHandleArray = assertIsDecryptedFhevmHandleArray;
exports.createDecryptedFhevmHandle = createDecryptedFhevmHandle;
exports.createDecryptedFhevmHandleArray = createDecryptedFhevmHandleArray;
exports.abiEncodeDecryptedFhevmHandles = abiEncodeDecryptedFhevmHandles;
const InvalidTypeError_js_1 = require("../base/errors/InvalidTypeError.js");
const FheType_js_1 = require("./FheType.js");
const utils_js_1 = require("../base/errors/utils.js");
const PRIVATE_TOKEN = Symbol("DecryptedFhevmHandle.token");
const VERIFY_ORIGIN_FUNC = Symbol("DecryptedFhevmHandle.verifyOrigin");
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
    [(_DecryptedFhevmHandleImpl_handle = new WeakMap(), _DecryptedFhevmHandleImpl_value = new WeakMap(), _DecryptedFhevmHandleImpl_originToken = new WeakMap(), VERIFY_ORIGIN_FUNC)](token) {
        return __classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_originToken, "f") === token;
    }
    toString() {
        return `DecryptedFhevmHandle<${__classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_handle, "f").fheType}>`;
    }
    toJson() {
        return {
            handle: __classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_handle, "f").bytes32Hex,
            fheType: __classPrivateFieldGet(this, _DecryptedFhevmHandleImpl_handle, "f").fheType,
        };
    }
}
Object.freeze(DecryptedFhevmHandleImpl.prototype);
function isDecryptedFhevmHandle(value, originToken) {
    if (!(value instanceof DecryptedFhevmHandleImpl))
        return false;
    return value[VERIFY_ORIGIN_FUNC](originToken);
}
function assertIsDecryptedFhevmHandle(value, options) {
    if (!isDecryptedFhevmHandle(value, options.originToken)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "DecryptedFhevmHandle",
        }, options);
    }
}
function isDecryptedFhevmHandleArray(values, originToken) {
    return values.every((v) => isDecryptedFhevmHandle(v, originToken));
}
function assertIsDecryptedFhevmHandleArray(values, options) {
    if (!Array.isArray(values)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof values,
            expectedType: "DecryptedFhevmHandle[]",
        }, options);
    }
    for (let i = 0; i < values.length; ++i) {
        if (!isDecryptedFhevmHandle(values[i], options.originToken)) {
            throw new InvalidTypeError_js_1.InvalidTypeError({
                subject: options.subject,
                index: i,
                type: typeof values[i],
                expectedType: "DecryptedFhevmHandle",
            }, options);
        }
    }
}
function createDecryptedFhevmHandle(handle, value, originToken) {
    const v = new DecryptedFhevmHandleImpl(PRIVATE_TOKEN, {
        handle,
        value: (0, FheType_js_1.asFheDecryptedValue)(handle.fheType, value),
        originToken,
    });
    Object.freeze(v);
    return v;
}
function createDecryptedFhevmHandleArray(orderedHandles, orderedClearValues, originToken) {
    if (orderedHandles.length !== orderedClearValues.length) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
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
function abiEncodeDecryptedFhevmHandles(fhevm, args) {
    const orderedHandles = args.orderedHandles;
    const abiTypes = [];
    const abiValues = [];
    for (const orderedHandle of orderedHandles) {
        const handleType = orderedHandle.handle.fheTypeId;
        const clearTextValueBigInt = _decryptedFheValueToBigInt(orderedHandle.value);
        abiTypes.push("uint256");
        switch (handleType) {
            case 7: {
                abiValues.push(`0x${clearTextValueBigInt.toString(16).padStart(40, "0")}`);
                break;
            }
            case 0: {
                if (clearTextValueBigInt !== BigInt(0) &&
                    clearTextValueBigInt !== BigInt(1)) {
                    throw new Error(`Invalid ebool clear text value ${clearTextValueBigInt}. Expecting 0 or 1.`);
                }
                abiValues.push(clearTextValueBigInt);
                break;
            }
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 8: {
                abiValues.push(clearTextValueBigInt);
                break;
            }
            default: {
                (0, utils_js_1.assertNever)(handleType, `Unsupported Fhevm primitive type id: ${handleType}`);
            }
        }
    }
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