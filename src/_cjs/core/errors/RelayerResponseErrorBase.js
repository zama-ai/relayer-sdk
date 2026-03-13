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
var _RelayerResponseErrorBase_status;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerResponseErrorBase = void 0;
const RelayerFetchErrorBase_js_1 = require("./RelayerFetchErrorBase.js");
class RelayerResponseErrorBase extends RelayerFetchErrorBase_js_1.RelayerFetchErrorBase {
    constructor(params) {
        const metaMessages = [`status: ${params.status}`];
        super({
            ...params,
            metaMessages,
        });
        _RelayerResponseErrorBase_status.set(this, void 0);
        __classPrivateFieldSet(this, _RelayerResponseErrorBase_status, params.status, "f");
    }
    get status() {
        return __classPrivateFieldGet(this, _RelayerResponseErrorBase_status, "f");
    }
}
exports.RelayerResponseErrorBase = RelayerResponseErrorBase;
_RelayerResponseErrorBase_status = new WeakMap();
//# sourceMappingURL=RelayerResponseErrorBase.js.map