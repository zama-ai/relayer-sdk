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
var _TrustedValueImpl_value, _TrustedValueImpl_originToken;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrustedValue = createTrustedValue;
exports.verifyTrustedValue = verifyTrustedValue;
class TrustedValueImpl {
    constructor(value, originToken) {
        _TrustedValueImpl_value.set(this, void 0);
        _TrustedValueImpl_originToken.set(this, void 0);
        __classPrivateFieldSet(this, _TrustedValueImpl_value, value, "f");
        __classPrivateFieldSet(this, _TrustedValueImpl_originToken, originToken, "f");
        Object.freeze(this);
    }
    static verify(trustedValue, token) {
        if (!(trustedValue instanceof TrustedValueImpl)) {
            throw new Error("Invalid TrustedValue");
        }
        if (token !== __classPrivateFieldGet(trustedValue, _TrustedValueImpl_originToken, "f")) {
            throw new Error("Token mismatch");
        }
        return __classPrivateFieldGet(trustedValue, _TrustedValueImpl_value, "f");
    }
    toString() {
        return "TrustedValue";
    }
    toJson() {
        return "TrustedValue";
    }
}
_TrustedValueImpl_value = new WeakMap(), _TrustedValueImpl_originToken = new WeakMap();
Object.freeze(TrustedValueImpl.prototype);
Object.freeze(TrustedValueImpl);
function createTrustedValue(value, token) {
    return new TrustedValueImpl(value, token);
}
function verifyTrustedValue(trustedValue, token) {
    return TrustedValueImpl.verify(trustedValue, token);
}
//# sourceMappingURL=trustedValue.js.map