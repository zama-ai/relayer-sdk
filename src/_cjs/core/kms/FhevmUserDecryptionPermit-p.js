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
var _FhevmUserDecryptionPermitImpl_eip712, _FhevmUserDecryptionPermitImpl_signature, _FhevmUserDecryptionPermitImpl_signerAddress;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVerifiedUserDecryptionPermit = isVerifiedUserDecryptionPermit;
exports.createFhevmUserDecryptionPermit = createFhevmUserDecryptionPermit;
class FhevmUserDecryptionPermitImpl {
    constructor(parameters) {
        _FhevmUserDecryptionPermitImpl_eip712.set(this, void 0);
        _FhevmUserDecryptionPermitImpl_signature.set(this, void 0);
        _FhevmUserDecryptionPermitImpl_signerAddress.set(this, void 0);
        Object.defineProperty(this, "verified", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        __classPrivateFieldSet(this, _FhevmUserDecryptionPermitImpl_eip712, parameters.eip712, "f");
        __classPrivateFieldSet(this, _FhevmUserDecryptionPermitImpl_signature, parameters.signature, "f");
        __classPrivateFieldSet(this, _FhevmUserDecryptionPermitImpl_signerAddress, parameters.signerAddress, "f");
    }
    get eip712() {
        return __classPrivateFieldGet(this, _FhevmUserDecryptionPermitImpl_eip712, "f");
    }
    get signature() {
        return __classPrivateFieldGet(this, _FhevmUserDecryptionPermitImpl_signature, "f");
    }
    get signerAddress() {
        return __classPrivateFieldGet(this, _FhevmUserDecryptionPermitImpl_signerAddress, "f");
    }
}
_FhevmUserDecryptionPermitImpl_eip712 = new WeakMap(), _FhevmUserDecryptionPermitImpl_signature = new WeakMap(), _FhevmUserDecryptionPermitImpl_signerAddress = new WeakMap();
function isVerifiedUserDecryptionPermit(value) {
    return value instanceof FhevmUserDecryptionPermitImpl;
}
function createFhevmUserDecryptionPermit(parameters) {
    return new FhevmUserDecryptionPermitImpl(parameters);
}
//# sourceMappingURL=FhevmUserDecryptionPermit-p.js.map