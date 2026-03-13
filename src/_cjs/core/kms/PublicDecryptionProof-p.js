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
var _PublicDecryptionProofImpl_decryptionProof, _PublicDecryptionProofImpl_orderedDecryptedHandles, _PublicDecryptionProofImpl_orderedAbiEncodedClearValues, _PublicDecryptionProofImpl_extraData;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDecryptionProofImpl = void 0;
class PublicDecryptionProofImpl {
    constructor(params) {
        _PublicDecryptionProofImpl_decryptionProof.set(this, void 0);
        _PublicDecryptionProofImpl_orderedDecryptedHandles.set(this, void 0);
        _PublicDecryptionProofImpl_orderedAbiEncodedClearValues.set(this, void 0);
        _PublicDecryptionProofImpl_extraData.set(this, void 0);
        __classPrivateFieldSet(this, _PublicDecryptionProofImpl_decryptionProof, params.decryptionProof, "f");
        __classPrivateFieldSet(this, _PublicDecryptionProofImpl_orderedDecryptedHandles, Object.freeze([
            ...params.orderedDecryptedHandles,
        ]), "f");
        __classPrivateFieldSet(this, _PublicDecryptionProofImpl_extraData, params.extraData, "f");
        __classPrivateFieldSet(this, _PublicDecryptionProofImpl_orderedAbiEncodedClearValues, params.orderedAbiEncodedClearValues, "f");
    }
    get decryptionProof() {
        return __classPrivateFieldGet(this, _PublicDecryptionProofImpl_decryptionProof, "f");
    }
    get orderedDecryptedHandles() {
        return __classPrivateFieldGet(this, _PublicDecryptionProofImpl_orderedDecryptedHandles, "f");
    }
    get orderedAbiEncodedClearValues() {
        return __classPrivateFieldGet(this, _PublicDecryptionProofImpl_orderedAbiEncodedClearValues, "f");
    }
    get extraData() {
        return __classPrivateFieldGet(this, _PublicDecryptionProofImpl_extraData, "f");
    }
}
exports.PublicDecryptionProofImpl = PublicDecryptionProofImpl;
_PublicDecryptionProofImpl_decryptionProof = new WeakMap(), _PublicDecryptionProofImpl_orderedDecryptedHandles = new WeakMap(), _PublicDecryptionProofImpl_orderedAbiEncodedClearValues = new WeakMap(), _PublicDecryptionProofImpl_extraData = new WeakMap();
Object.freeze(PublicDecryptionProofImpl);
Object.freeze(PublicDecryptionProofImpl.prototype);
//# sourceMappingURL=PublicDecryptionProof-p.js.map