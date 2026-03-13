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
var _KmsVerifierContractDataImpl_owner, _KmsVerifierContractDataImpl_address, _KmsVerifierContractDataImpl_eip712Domain, _KmsVerifierContractDataImpl_kmsSigners, _KmsVerifierContractDataImpl_kmsSignersSet, _KmsVerifierContractDataImpl_kmsSignerThreshold;
import { assertOwnedBy } from "../runtime/CoreFhevmRuntime-p.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("KmsVerifierContractData.token");
const VERIFY_FUNC = Symbol("KmsVerifierContractData.verify");
////////////////////////////////////////////////////////////////////////////////
// KmsVerifierContractData (private implementation)
////////////////////////////////////////////////////////////////////////////////
class KmsVerifierContractDataImpl {
    constructor(privateToken, owner, parameters) {
        _KmsVerifierContractDataImpl_owner.set(this, void 0);
        _KmsVerifierContractDataImpl_address.set(this, void 0);
        _KmsVerifierContractDataImpl_eip712Domain.set(this, void 0);
        _KmsVerifierContractDataImpl_kmsSigners.set(this, void 0);
        _KmsVerifierContractDataImpl_kmsSignersSet.set(this, void 0);
        _KmsVerifierContractDataImpl_kmsSignerThreshold.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _KmsVerifierContractDataImpl_owner, owner, "f");
        __classPrivateFieldSet(this, _KmsVerifierContractDataImpl_address, parameters.address, "f");
        __classPrivateFieldSet(this, _KmsVerifierContractDataImpl_eip712Domain, { ...parameters.eip712Domain }, "f");
        __classPrivateFieldSet(this, _KmsVerifierContractDataImpl_kmsSigners, [...parameters.kmsSigners], "f");
        __classPrivateFieldSet(this, _KmsVerifierContractDataImpl_kmsSignerThreshold, parameters.kmsSignerThreshold, "f");
        __classPrivateFieldSet(this, _KmsVerifierContractDataImpl_kmsSignersSet, new Set(__classPrivateFieldGet(this, _KmsVerifierContractDataImpl_kmsSigners, "f").map((addr) => addr.toLowerCase())), "f");
        Object.freeze(__classPrivateFieldGet(this, _KmsVerifierContractDataImpl_eip712Domain, "f"));
        Object.freeze(__classPrivateFieldGet(this, _KmsVerifierContractDataImpl_kmsSigners, "f"));
        Object.freeze(this);
    }
    get address() {
        return __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_address, "f");
    }
    get eip712Domain() {
        return __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_eip712Domain, "f");
    }
    get gatewayChainId() {
        return __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_eip712Domain, "f").chainId;
    }
    get kmsSigners() {
        return __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_kmsSigners, "f");
    }
    get kmsSignerThreshold() {
        return __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_kmsSignerThreshold, "f");
    }
    get verifyingContractAddressDecryption() {
        return __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_eip712Domain, "f").verifyingContract;
    }
    has(signer) {
        return __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_kmsSignersSet, "f").has(signer);
    }
    static [(_KmsVerifierContractDataImpl_owner = new WeakMap(), _KmsVerifierContractDataImpl_address = new WeakMap(), _KmsVerifierContractDataImpl_eip712Domain = new WeakMap(), _KmsVerifierContractDataImpl_kmsSigners = new WeakMap(), _KmsVerifierContractDataImpl_kmsSignersSet = new WeakMap(), _KmsVerifierContractDataImpl_kmsSignerThreshold = new WeakMap(), VERIFY_FUNC)](instance, owner) {
        if (!(instance instanceof KmsVerifierContractDataImpl)) {
            throw new Error("Invalid KmsVerifierContractData instance");
        }
        assertOwnedBy({
            actualOwner: __classPrivateFieldGet(instance, _KmsVerifierContractDataImpl_owner, "f"),
            expectedOwner: owner,
            name: "KmsVerifierContractData",
        });
    }
    toJson() {
        return {
            address: __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_address, "f"),
            eip712Domain: __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_eip712Domain, "f"),
            kmsSigners: __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_kmsSigners, "f"),
            kmsSignerThreshold: __classPrivateFieldGet(this, _KmsVerifierContractDataImpl_kmsSignerThreshold, "f"),
        };
    }
}
// Prevent prototype pollution and constructor access
Object.freeze(KmsVerifierContractDataImpl.prototype);
Object.freeze(KmsVerifierContractDataImpl);
////////////////////////////////////////////////////////////////////////////////
export function createKmsVerifierContractData(owner, parameters) {
    return new KmsVerifierContractDataImpl(PRIVATE_TOKEN, owner, parameters);
}
////////////////////////////////////////////////////////////////////////////////
/**
 * Verifies that the given `KmsVerifierContractData` instance is owned
 * by the given runtime. Throws if not.
 */
export function assertKmsVerifierContractDataOwnedBy(data, owner) {
    KmsVerifierContractDataImpl[VERIFY_FUNC](data, owner);
}
//# sourceMappingURL=KmsVerifierContractData-p.js.map