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
var _KmsSignersContextImpl_owner, _KmsSignersContextImpl_address, _KmsSignersContextImpl_kmsSigners, _KmsSignersContextImpl_kmsSignersSet, _KmsSignersContextImpl_kmsSignerThreshold;
import { addressToChecksummedAddress } from "../base/address.js";
import { DuplicateSignerError, ThresholdSignerError, UnknownSignerError, } from "../errors/SignersError.js";
import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
import { assertOwnedBy } from "../runtime/CoreFhevmRuntime-p.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("KmsSignersContext.token");
const VERIFY_FUNC = Symbol("KmsSignersContext.verify");
////////////////////////////////////////////////////////////////////////////////
// KmsVerifierContractData (private implementation)
////////////////////////////////////////////////////////////////////////////////
class KmsSignersContextImpl {
    constructor(privateToken, owner, parameters) {
        _KmsSignersContextImpl_owner.set(this, void 0);
        _KmsSignersContextImpl_address.set(this, void 0);
        _KmsSignersContextImpl_kmsSigners.set(this, void 0);
        _KmsSignersContextImpl_kmsSignersSet.set(this, void 0);
        _KmsSignersContextImpl_kmsSignerThreshold.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _KmsSignersContextImpl_owner, owner, "f");
        __classPrivateFieldSet(this, _KmsSignersContextImpl_address, parameters.address, "f");
        __classPrivateFieldSet(this, _KmsSignersContextImpl_kmsSigners, [...parameters.kmsSigners], "f");
        __classPrivateFieldSet(this, _KmsSignersContextImpl_kmsSignerThreshold, parameters.kmsSignerThreshold, "f");
        __classPrivateFieldSet(this, _KmsSignersContextImpl_kmsSignersSet, new Set(__classPrivateFieldGet(this, _KmsSignersContextImpl_kmsSigners, "f").map((addr) => addr.toLowerCase())), "f");
        Object.freeze(__classPrivateFieldGet(this, _KmsSignersContextImpl_kmsSigners, "f"));
        Object.freeze(this);
    }
    get address() {
        return __classPrivateFieldGet(this, _KmsSignersContextImpl_address, "f");
    }
    get signers() {
        return __classPrivateFieldGet(this, _KmsSignersContextImpl_kmsSigners, "f");
    }
    get threshold() {
        return __classPrivateFieldGet(this, _KmsSignersContextImpl_kmsSignerThreshold, "f");
    }
    has(signer) {
        return __classPrivateFieldGet(this, _KmsSignersContextImpl_kmsSignersSet, "f").has(signer);
    }
    static [(_KmsSignersContextImpl_owner = new WeakMap(), _KmsSignersContextImpl_address = new WeakMap(), _KmsSignersContextImpl_kmsSigners = new WeakMap(), _KmsSignersContextImpl_kmsSignersSet = new WeakMap(), _KmsSignersContextImpl_kmsSignerThreshold = new WeakMap(), VERIFY_FUNC)](instance, owner) {
        if (!(instance instanceof KmsSignersContextImpl)) {
            throw new Error("Invalid KmsSignersContext instance");
        }
        assertOwnedBy({
            actualOwner: __classPrivateFieldGet(instance, _KmsSignersContextImpl_owner, "f"),
            expectedOwner: owner,
            name: "KmsSignersContext",
        });
    }
    toJson() {
        return {
            address: __classPrivateFieldGet(this, _KmsSignersContextImpl_address, "f"),
            signers: __classPrivateFieldGet(this, _KmsSignersContextImpl_kmsSigners, "f"),
            threshold: __classPrivateFieldGet(this, _KmsSignersContextImpl_kmsSignerThreshold, "f"),
        };
    }
}
// Prevent prototype pollution and constructor access
Object.freeze(KmsSignersContextImpl.prototype);
Object.freeze(KmsSignersContextImpl);
////////////////////////////////////////////////////////////////////////////////
export function createKmsSignersContext(owner, parameters) {
    const { address, kmsSigners, kmsSignerThreshold } = parameters;
    return new KmsSignersContextImpl(PRIVATE_TOKEN, owner, {
        address: addressToChecksummedAddress(address),
        kmsSignerThreshold: Number(kmsSignerThreshold),
        kmsSigners: kmsSigners.map(addressToChecksummedAddress),
    });
}
////////////////////////////////////////////////////////////////////////////////
/**
 * Verifies that the given `KmsSignersContext` instance is owned
 * by the given runtime. Throws if not.
 */
export function assertKmsSignersContextOwnedBy(data, owner) {
    KmsSignersContextImpl[VERIFY_FUNC](data, owner);
}
////////////////////////////////////////////////////////////////////////////////
export function assertKmsSignerThreshold(kmsSignersContext, recoveredAddresses) {
    const type = "kms";
    const addressMap = new Set();
    recoveredAddresses.forEach((address) => {
        if (addressMap.has(address.toLowerCase())) {
            throw new DuplicateSignerError({
                duplicateAddress: address,
                type,
            });
        }
        addressMap.add(address.toLowerCase());
    });
    for (const address of recoveredAddresses) {
        if (!kmsSignersContext.has(address.toLowerCase())) {
            throw new UnknownSignerError({
                unknownAddress: address,
                type,
            });
        }
    }
    if (recoveredAddresses.length < kmsSignersContext.threshold) {
        throw new ThresholdSignerError({
            type,
        });
    }
}
////////////////////////////////////////////////////////////////////////////////
export function isKmsSignersContext(value) {
    return value instanceof KmsSignersContextImpl;
}
////////////////////////////////////////////////////////////////////////////////
export function assertIsKmsSignersContext(value, options) {
    if (!isKmsSignersContext(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "KmsSignersContext",
        }, options);
    }
}
//# sourceMappingURL=KmsSignersContext-p.js.map