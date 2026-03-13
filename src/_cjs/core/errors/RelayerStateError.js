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
var _RelayerStateError_state;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerStateError = void 0;
const RelayerErrorBase_js_1 = require("./RelayerErrorBase.js");
class RelayerStateError extends RelayerErrorBase_js_1.RelayerErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerStateError",
        });
        _RelayerStateError_state.set(this, void 0);
        __classPrivateFieldSet(this, _RelayerStateError_state, { ...params.state }, "f");
        Object.freeze(__classPrivateFieldGet(this, _RelayerStateError_state, "f"));
    }
    get state() {
        return __classPrivateFieldGet(this, _RelayerStateError_state, "f");
    }
}
exports.RelayerStateError = RelayerStateError;
_RelayerStateError_state = new WeakMap();
//# sourceMappingURL=RelayerStateError.js.map