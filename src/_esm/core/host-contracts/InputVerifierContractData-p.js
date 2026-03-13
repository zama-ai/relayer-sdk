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
var _InputVerifierContractDataImpl_owner, _InputVerifierContractDataImpl_address, _InputVerifierContractDataImpl_eip712Domain, _InputVerifierContractDataImpl_coprocessorSigners, _InputVerifierContractDataImpl_coprocessorSignerThreshold, _InputVerifierContractDataImpl_coprocessorSignersSet;
import { assertOwnedBy } from "../runtime/CoreFhevmRuntime-p.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("InputVerifierContractData.token");
const VERIFY_FUNC = Symbol("InputVerifierContractData.verify");
////////////////////////////////////////////////////////////////////////////////
// InputVerifier (private implementation)
////////////////////////////////////////////////////////////////////////////////
class InputVerifierContractDataImpl {
    constructor(privateToken, owner, params) {
        _InputVerifierContractDataImpl_owner.set(this, void 0);
        _InputVerifierContractDataImpl_address.set(this, void 0);
        _InputVerifierContractDataImpl_eip712Domain.set(this, void 0);
        _InputVerifierContractDataImpl_coprocessorSigners.set(this, void 0);
        _InputVerifierContractDataImpl_coprocessorSignerThreshold.set(this, void 0);
        _InputVerifierContractDataImpl_coprocessorSignersSet.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _InputVerifierContractDataImpl_owner, owner, "f");
        __classPrivateFieldSet(this, _InputVerifierContractDataImpl_address, params.address, "f");
        __classPrivateFieldSet(this, _InputVerifierContractDataImpl_eip712Domain, { ...params.eip712Domain }, "f");
        __classPrivateFieldSet(this, _InputVerifierContractDataImpl_coprocessorSigners, [...params.coprocessorSigners], "f");
        __classPrivateFieldSet(this, _InputVerifierContractDataImpl_coprocessorSignerThreshold, params.coprocessorSignerThreshold, "f");
        __classPrivateFieldSet(this, _InputVerifierContractDataImpl_coprocessorSignersSet, new Set(__classPrivateFieldGet(this, _InputVerifierContractDataImpl_coprocessorSigners, "f").map((addr) => addr.toLowerCase())), "f");
        Object.freeze(__classPrivateFieldGet(this, _InputVerifierContractDataImpl_eip712Domain, "f"));
        Object.freeze(__classPrivateFieldGet(this, _InputVerifierContractDataImpl_coprocessorSigners, "f"));
        Object.freeze(this);
    }
    get address() {
        return __classPrivateFieldGet(this, _InputVerifierContractDataImpl_address, "f");
    }
    get eip712Domain() {
        return __classPrivateFieldGet(this, _InputVerifierContractDataImpl_eip712Domain, "f");
    }
    get gatewayChainId() {
        return __classPrivateFieldGet(this, _InputVerifierContractDataImpl_eip712Domain, "f").chainId;
    }
    get coprocessorSigners() {
        return __classPrivateFieldGet(this, _InputVerifierContractDataImpl_coprocessorSigners, "f");
    }
    get coprocessorSignerThreshold() {
        return __classPrivateFieldGet(this, _InputVerifierContractDataImpl_coprocessorSignerThreshold, "f");
    }
    get verifyingContractAddressInputVerification() {
        return __classPrivateFieldGet(this, _InputVerifierContractDataImpl_eip712Domain, "f").verifyingContract;
    }
    has(signer) {
        return __classPrivateFieldGet(this, _InputVerifierContractDataImpl_coprocessorSignersSet, "f").has(signer);
    }
    static [(_InputVerifierContractDataImpl_owner = new WeakMap(), _InputVerifierContractDataImpl_address = new WeakMap(), _InputVerifierContractDataImpl_eip712Domain = new WeakMap(), _InputVerifierContractDataImpl_coprocessorSigners = new WeakMap(), _InputVerifierContractDataImpl_coprocessorSignerThreshold = new WeakMap(), _InputVerifierContractDataImpl_coprocessorSignersSet = new WeakMap(), VERIFY_FUNC)](instance, owner) {
        if (!(instance instanceof InputVerifierContractDataImpl)) {
            throw new Error("Invalid InputVerifierContractData instance");
        }
        assertOwnedBy({
            actualOwner: __classPrivateFieldGet(instance, _InputVerifierContractDataImpl_owner, "f"),
            expectedOwner: owner,
            name: "InputVerifierContractData",
        });
    }
    toJson() {
        return {
            address: __classPrivateFieldGet(this, _InputVerifierContractDataImpl_address, "f"),
            eip712Domain: __classPrivateFieldGet(this, _InputVerifierContractDataImpl_eip712Domain, "f"),
            coprocessorSigners: __classPrivateFieldGet(this, _InputVerifierContractDataImpl_coprocessorSigners, "f"),
            coprocessorSignerThreshold: __classPrivateFieldGet(this, _InputVerifierContractDataImpl_coprocessorSignerThreshold, "f"),
        };
    }
}
// Prevent prototype pollution and constructor access
Object.freeze(InputVerifierContractDataImpl.prototype);
Object.freeze(InputVerifierContractDataImpl);
////////////////////////////////////////////////////////////////////////////////
export function createInputVerifierContractData(owner, parameters) {
    return new InputVerifierContractDataImpl(PRIVATE_TOKEN, owner, parameters);
}
////////////////////////////////////////////////////////////////////////////////
/**
 * Verifies that the given `InputVerifierContractData` instance is owned
 * by the given runtime. Throws if not.
 */
export function assertInputVerifierContractDataOwnedBy(data, owner) {
    InputVerifierContractDataImpl[VERIFY_FUNC](data, owner);
}
//# sourceMappingURL=InputVerifierContractData-p.js.map