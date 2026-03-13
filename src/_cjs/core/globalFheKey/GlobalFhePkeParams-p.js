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
var _GlobalFhePkeParamsImpl_owner, _GlobalFhePkeParamsImpl_crs, _GlobalFhePkeParamsImpl_publicKey;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGlobalFhePkeParams = createGlobalFhePkeParams;
exports.assertGlobalFhePkeParamsOwnedBy = assertGlobalFhePkeParamsOwnedBy;
const CoreFhevmRuntime_p_js_1 = require("../runtime/CoreFhevmRuntime-p.js");
const PRIVATE_TOKEN = Symbol("GlobalFhePkeParams.token");
const VERIFY_FUNC = Symbol("GlobalFhePkeParams.verify");
class GlobalFhePkeParamsImpl {
    constructor(privateToken, owner, parameters) {
        _GlobalFhePkeParamsImpl_owner.set(this, void 0);
        _GlobalFhePkeParamsImpl_crs.set(this, void 0);
        _GlobalFhePkeParamsImpl_publicKey.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _GlobalFhePkeParamsImpl_owner, owner, "f");
        __classPrivateFieldSet(this, _GlobalFhePkeParamsImpl_publicKey, Object.freeze({ ...parameters.publicKey }), "f");
        __classPrivateFieldSet(this, _GlobalFhePkeParamsImpl_crs, Object.freeze({ ...parameters.crs }), "f");
        Object.freeze(this);
    }
    get publicKey() {
        return __classPrivateFieldGet(this, _GlobalFhePkeParamsImpl_publicKey, "f");
    }
    get crs() {
        return __classPrivateFieldGet(this, _GlobalFhePkeParamsImpl_crs, "f");
    }
    static [(_GlobalFhePkeParamsImpl_owner = new WeakMap(), _GlobalFhePkeParamsImpl_crs = new WeakMap(), _GlobalFhePkeParamsImpl_publicKey = new WeakMap(), VERIFY_FUNC)](instance, owner) {
        if (!(instance instanceof GlobalFhePkeParamsImpl)) {
            throw new Error("Invalid GlobalFhePkeParams instance");
        }
        (0, CoreFhevmRuntime_p_js_1.assertOwnedBy)({
            actualOwner: __classPrivateFieldGet(instance, _GlobalFhePkeParamsImpl_owner, "f"),
            expectedOwner: owner,
            name: "GlobalFhePkeParams",
        });
    }
}
Object.freeze(GlobalFhePkeParamsImpl.prototype);
Object.freeze(GlobalFhePkeParamsImpl);
function createGlobalFhePkeParams(owner, parameters) {
    return new GlobalFhePkeParamsImpl(PRIVATE_TOKEN, owner, parameters);
}
function assertGlobalFhePkeParamsOwnedBy(data, owner) {
    GlobalFhePkeParamsImpl[VERIFY_FUNC](data, owner);
}
//# sourceMappingURL=GlobalFhePkeParams-p.js.map