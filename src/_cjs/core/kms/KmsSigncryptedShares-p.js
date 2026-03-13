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
var _KmsSigncryptedSharesImpl_metadata, _KmsSigncryptedSharesImpl_shares;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKmsSigncryptedShares = createKmsSigncryptedShares;
exports.getShares = getShares;
exports.getMetadata = getMetadata;
const PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN = Symbol("KmsSigncryptedShares.token");
const GET_METADATA_FUNC = Symbol("KmsSigncryptedShares.getMetadata");
const GET_SHARES_FUNC = Symbol("KmsSigncryptedShares.getShares");
class KmsSigncryptedSharesImpl {
    constructor(metadata, shares) {
        _KmsSigncryptedSharesImpl_metadata.set(this, void 0);
        _KmsSigncryptedSharesImpl_shares.set(this, void 0);
        __classPrivateFieldSet(this, _KmsSigncryptedSharesImpl_metadata, {
            kmsSignersContext: metadata.kmsSignersContext,
            eip712Domain: metadata.eip712Domain,
            eip712Signature: metadata.eip712Signature,
            eip712SignerAddress: metadata.eip712SignerAddress,
            fhevmHandles: [...metadata.fhevmHandles],
        }, "f");
        Object.freeze(__classPrivateFieldGet(this, _KmsSigncryptedSharesImpl_metadata, "f"));
        Object.freeze(__classPrivateFieldGet(this, _KmsSigncryptedSharesImpl_metadata, "f").fhevmHandles);
        __classPrivateFieldSet(this, _KmsSigncryptedSharesImpl_shares, [...shares], "f");
        Object.freeze(__classPrivateFieldGet(this, _KmsSigncryptedSharesImpl_shares, "f"));
        __classPrivateFieldGet(this, _KmsSigncryptedSharesImpl_shares, "f").forEach((share) => Object.freeze(share));
    }
    [(_KmsSigncryptedSharesImpl_metadata = new WeakMap(), _KmsSigncryptedSharesImpl_shares = new WeakMap(), GET_SHARES_FUNC)](token) {
        if (token !== PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN) {
            throw new Error("Unauthorized");
        }
        return __classPrivateFieldGet(this, _KmsSigncryptedSharesImpl_shares, "f");
    }
    [GET_METADATA_FUNC](token) {
        if (token !== PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN) {
            throw new Error("Unauthorized");
        }
        return __classPrivateFieldGet(this, _KmsSigncryptedSharesImpl_metadata, "f");
    }
}
function createKmsSigncryptedShares(metadata, shares) {
    return new KmsSigncryptedSharesImpl(metadata, shares);
}
function getShares(signcryptedShares) {
    if (!(signcryptedShares instanceof KmsSigncryptedSharesImpl)) {
        throw new Error("Invalid KmsSigncryptedShares");
    }
    return signcryptedShares[GET_SHARES_FUNC](PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN);
}
function getMetadata(signcryptedShares) {
    if (!(signcryptedShares instanceof KmsSigncryptedSharesImpl)) {
        throw new Error("Invalid KmsSigncryptedShares");
    }
    return signcryptedShares[GET_METADATA_FUNC](PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN);
}
//# sourceMappingURL=KmsSigncryptedShares-p.js.map