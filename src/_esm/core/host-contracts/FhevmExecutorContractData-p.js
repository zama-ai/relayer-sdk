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
var _FhevmExecutorContractDataImpl_owner, _FhevmExecutorContractDataImpl_address, _FhevmExecutorContractDataImpl_handleVersion, _FhevmExecutorContractDataImpl_aclContractAddress, _FhevmExecutorContractDataImpl_inputVerifierContractAddress, _FhevmExecutorContractDataImpl_hcuLimitContractAddress;
import { assertOwnedBy } from "../runtime/CoreFhevmRuntime-p.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("FhevmExecutorContractData.token");
const VERIFY_FUNC = Symbol("FhevmExecutorContractData.verify");
////////////////////////////////////////////////////////////////////////////////
// FHEVMExecutor (private implementation)
////////////////////////////////////////////////////////////////////////////////
class FhevmExecutorContractDataImpl {
    constructor(privateToken, owner, parameters) {
        _FhevmExecutorContractDataImpl_owner.set(this, void 0);
        _FhevmExecutorContractDataImpl_address.set(this, void 0);
        _FhevmExecutorContractDataImpl_handleVersion.set(this, void 0);
        _FhevmExecutorContractDataImpl_aclContractAddress.set(this, void 0);
        _FhevmExecutorContractDataImpl_inputVerifierContractAddress.set(this, void 0);
        _FhevmExecutorContractDataImpl_hcuLimitContractAddress.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _FhevmExecutorContractDataImpl_owner, owner, "f");
        __classPrivateFieldSet(this, _FhevmExecutorContractDataImpl_address, parameters.address, "f");
        __classPrivateFieldSet(this, _FhevmExecutorContractDataImpl_handleVersion, parameters.handleVersion, "f");
        __classPrivateFieldSet(this, _FhevmExecutorContractDataImpl_aclContractAddress, parameters.aclContractAddress, "f");
        __classPrivateFieldSet(this, _FhevmExecutorContractDataImpl_inputVerifierContractAddress, parameters.inputVerifierContractAddress, "f");
        __classPrivateFieldSet(this, _FhevmExecutorContractDataImpl_hcuLimitContractAddress, parameters.hcuLimitContractAddress, "f");
        Object.freeze(this);
    }
    get address() {
        return __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_address, "f");
    }
    get aclContractAddress() {
        return __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_aclContractAddress, "f");
    }
    get inputVerifierContractAddress() {
        return __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_inputVerifierContractAddress, "f");
    }
    get hcuLimitContractAddress() {
        return __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_hcuLimitContractAddress, "f");
    }
    get handleVersion() {
        return __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_handleVersion, "f");
    }
    static [(_FhevmExecutorContractDataImpl_owner = new WeakMap(), _FhevmExecutorContractDataImpl_address = new WeakMap(), _FhevmExecutorContractDataImpl_handleVersion = new WeakMap(), _FhevmExecutorContractDataImpl_aclContractAddress = new WeakMap(), _FhevmExecutorContractDataImpl_inputVerifierContractAddress = new WeakMap(), _FhevmExecutorContractDataImpl_hcuLimitContractAddress = new WeakMap(), VERIFY_FUNC)](instance, owner) {
        if (!(instance instanceof FhevmExecutorContractDataImpl)) {
            throw new Error("Invalid FhevmExecutorContractData instance");
        }
        assertOwnedBy({
            actualOwner: __classPrivateFieldGet(instance, _FhevmExecutorContractDataImpl_owner, "f"),
            expectedOwner: owner,
            name: "FhevmExecutorContractData",
        });
    }
    toJson() {
        return {
            address: __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_address, "f"),
            aclContractAddress: __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_aclContractAddress, "f"),
            inputVerifierContractAddress: __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_inputVerifierContractAddress, "f"),
            hcuLimitContractAddress: __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_hcuLimitContractAddress, "f"),
            handleVersion: __classPrivateFieldGet(this, _FhevmExecutorContractDataImpl_handleVersion, "f"),
        };
    }
}
// Prevent prototype pollution and constructor access
Object.freeze(FhevmExecutorContractDataImpl.prototype);
Object.freeze(FhevmExecutorContractDataImpl);
////////////////////////////////////////////////////////////////////////////////
export function createFhevmExecutorContractData(owner, parameters) {
    const { address, aclContractAddress, inputVerifierContractAddress, hcuLimitContractAddress, handleVersion, } = parameters;
    return new FhevmExecutorContractDataImpl(PRIVATE_TOKEN, owner, {
        address,
        aclContractAddress,
        inputVerifierContractAddress,
        hcuLimitContractAddress,
        handleVersion,
    });
}
/**
 * Verifies that the given `FHEVMExecutorContractData` instance is owned
 * by the given runtime. Throws if not.
 */
export function assertFHEVMExecutorContractDataOwnedBy(data, owner) {
    FhevmExecutorContractDataImpl[VERIFY_FUNC](data, owner);
}
//# sourceMappingURL=FhevmExecutorContractData-p.js.map