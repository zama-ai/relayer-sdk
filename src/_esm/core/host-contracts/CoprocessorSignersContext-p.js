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
var _CoprocessorSignersContextImpl_owner, _CoprocessorSignersContextImpl_address, _CoprocessorSignersContextImpl_coprocessorSigners, _CoprocessorSignersContextImpl_coprocessorSignersSet, _CoprocessorSignersContextImpl_coprocessorSignerThreshold;
import { DuplicateSignerError, ThresholdSignerError, UnknownSignerError, } from "../errors/SignersError.js";
import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
import { assertOwnedBy } from "../runtime/CoreFhevmRuntime-p.js";
const PRIVATE_TOKEN = Symbol("CoprocessorSignersContext.token");
const VERIFY_FUNC = Symbol("CoprocessorSignersContext.verify");
////////////////////////////////////////////////////////////////////////////////
// CoprocessorSignersContext (private implementation)
////////////////////////////////////////////////////////////////////////////////
class CoprocessorSignersContextImpl {
    constructor(privateToken, owner, parameters) {
        _CoprocessorSignersContextImpl_owner.set(this, void 0);
        _CoprocessorSignersContextImpl_address.set(this, void 0);
        _CoprocessorSignersContextImpl_coprocessorSigners.set(this, void 0);
        _CoprocessorSignersContextImpl_coprocessorSignersSet.set(this, void 0);
        _CoprocessorSignersContextImpl_coprocessorSignerThreshold.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _CoprocessorSignersContextImpl_owner, owner, "f");
        __classPrivateFieldSet(this, _CoprocessorSignersContextImpl_address, parameters.address, "f");
        __classPrivateFieldSet(this, _CoprocessorSignersContextImpl_coprocessorSigners, [...parameters.coprocessorSigners], "f");
        __classPrivateFieldSet(this, _CoprocessorSignersContextImpl_coprocessorSignerThreshold, parameters.coprocessorSignerThreshold, "f");
        __classPrivateFieldSet(this, _CoprocessorSignersContextImpl_coprocessorSignersSet, new Set(__classPrivateFieldGet(this, _CoprocessorSignersContextImpl_coprocessorSigners, "f").map((addr) => addr.toLowerCase())), "f");
        Object.freeze(__classPrivateFieldGet(this, _CoprocessorSignersContextImpl_coprocessorSigners, "f"));
        Object.freeze(this);
    }
    get address() {
        return __classPrivateFieldGet(this, _CoprocessorSignersContextImpl_address, "f");
    }
    get signers() {
        return __classPrivateFieldGet(this, _CoprocessorSignersContextImpl_coprocessorSigners, "f");
    }
    get threshold() {
        return __classPrivateFieldGet(this, _CoprocessorSignersContextImpl_coprocessorSignerThreshold, "f");
    }
    has(signer) {
        return __classPrivateFieldGet(this, _CoprocessorSignersContextImpl_coprocessorSignersSet, "f").has(signer);
    }
    static [(_CoprocessorSignersContextImpl_owner = new WeakMap(), _CoprocessorSignersContextImpl_address = new WeakMap(), _CoprocessorSignersContextImpl_coprocessorSigners = new WeakMap(), _CoprocessorSignersContextImpl_coprocessorSignersSet = new WeakMap(), _CoprocessorSignersContextImpl_coprocessorSignerThreshold = new WeakMap(), VERIFY_FUNC)](instance, owner) {
        if (!(instance instanceof CoprocessorSignersContextImpl)) {
            throw new Error("Invalid CoprocessorSignersContext instance");
        }
        assertOwnedBy({
            actualOwner: __classPrivateFieldGet(instance, _CoprocessorSignersContextImpl_owner, "f"),
            expectedOwner: owner,
            name: "CoprocessorSignersContext",
        });
    }
    toJson() {
        return {
            address: __classPrivateFieldGet(this, _CoprocessorSignersContextImpl_address, "f"),
            signers: __classPrivateFieldGet(this, _CoprocessorSignersContextImpl_coprocessorSigners, "f"),
            threshold: __classPrivateFieldGet(this, _CoprocessorSignersContextImpl_coprocessorSignerThreshold, "f"),
        };
    }
}
// Prevent prototype pollution and constructor access
Object.freeze(CoprocessorSignersContextImpl.prototype);
Object.freeze(CoprocessorSignersContextImpl);
////////////////////////////////////////////////////////////////////////////////
export function createCoprocessorSignersContext(owner, parameters) {
    return new CoprocessorSignersContextImpl(PRIVATE_TOKEN, owner, parameters);
}
////////////////////////////////////////////////////////////////////////////////
/**
 * Verifies that the given `CoprocessorSignersContext` instance was created
 * by the given runtime. Throws if not.
 */
export function assertCoprocessorSignersContextOwnedBy(data, owner) {
    CoprocessorSignersContextImpl[VERIFY_FUNC](data, owner);
}
////////////////////////////////////////////////////////////////////////////////
export function assertCoprocessorSignerThreshold(coprocessorSignersContext, recoveredAddresses) {
    const type = "coprocessor";
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
        if (!coprocessorSignersContext.has(address.toLowerCase())) {
            throw new UnknownSignerError({
                unknownAddress: address,
                type,
            });
        }
    }
    if (recoveredAddresses.length < coprocessorSignersContext.threshold) {
        throw new ThresholdSignerError({
            type,
        });
    }
}
////////////////////////////////////////////////////////////////////////////////
export function isCoprocessorSignersContext(value) {
    return value instanceof CoprocessorSignersContextImpl;
}
////////////////////////////////////////////////////////////////////////////////
export function assertIsCoprocessorSignersContext(value, options) {
    if (!isCoprocessorSignersContext(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "CoprocessorSignersContext",
        }, options);
    }
}
//# sourceMappingURL=CoprocessorSignersContext-p.js.map