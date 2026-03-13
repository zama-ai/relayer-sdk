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
var _ACLPublicDecryptionError_handles;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACLUserDecryptionError = exports.ACLPublicDecryptionError = void 0;
const ContractErrorBase_js_1 = require("./ContractErrorBase.js");
class ACLPublicDecryptionError extends ContractErrorBase_js_1.ContractErrorBase {
    constructor({ contractAddress, handles, }) {
        const handleList = handles.join(", ");
        super({
            message: handles.length === 1
                ? `Handle ${handles[0]} is not allowed for public decryption`
                : `${handles.length} handles are not allowed for public decryption: ${handleList}`,
            name: "ACLPublicDecryptionError",
            contractAddress,
            contractName: "ACL",
        });
        _ACLPublicDecryptionError_handles.set(this, void 0);
        __classPrivateFieldSet(this, _ACLPublicDecryptionError_handles, handles, "f");
    }
    get handles() {
        return __classPrivateFieldGet(this, _ACLPublicDecryptionError_handles, "f");
    }
}
exports.ACLPublicDecryptionError = ACLPublicDecryptionError;
_ACLPublicDecryptionError_handles = new WeakMap();
class ACLUserDecryptionError extends ContractErrorBase_js_1.ContractErrorBase {
    constructor({ contractAddress, message, }) {
        super({
            message,
            name: "ACLUserDecryptionError",
            contractAddress,
            contractName: "ACL",
        });
    }
}
exports.ACLUserDecryptionError = ACLUserDecryptionError;
//# sourceMappingURL=ACLError.js.map