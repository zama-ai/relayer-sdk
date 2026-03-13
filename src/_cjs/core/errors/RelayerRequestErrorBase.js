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
var _RelayerRequestErrorBase_url, _RelayerRequestErrorBase_operation, _RelayerRequestErrorBase_jobId;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerRequestErrorBase = void 0;
const RelayerErrorBase_js_1 = require("./RelayerErrorBase.js");
class RelayerRequestErrorBase extends RelayerErrorBase_js_1.RelayerErrorBase {
    constructor(params) {
        const metaMessages = [
            ...(params.metaMessages ?? []),
            `url: ${params.url}`,
            `operation: ${params.operation}`,
            ...(params.jobId !== undefined ? [`jobId: ${params.jobId}`] : []),
        ];
        super({
            ...params,
            metaMessages,
        });
        _RelayerRequestErrorBase_url.set(this, void 0);
        _RelayerRequestErrorBase_operation.set(this, void 0);
        _RelayerRequestErrorBase_jobId.set(this, void 0);
        __classPrivateFieldSet(this, _RelayerRequestErrorBase_url, params.url, "f");
        __classPrivateFieldSet(this, _RelayerRequestErrorBase_operation, params.operation, "f");
        __classPrivateFieldSet(this, _RelayerRequestErrorBase_jobId, params.jobId, "f");
    }
    get url() {
        return __classPrivateFieldGet(this, _RelayerRequestErrorBase_url, "f");
    }
    get jobId() {
        return __classPrivateFieldGet(this, _RelayerRequestErrorBase_jobId, "f");
    }
    get operation() {
        return __classPrivateFieldGet(this, _RelayerRequestErrorBase_operation, "f");
    }
}
exports.RelayerRequestErrorBase = RelayerRequestErrorBase;
_RelayerRequestErrorBase_url = new WeakMap(), _RelayerRequestErrorBase_operation = new WeakMap(), _RelayerRequestErrorBase_jobId = new WeakMap();
//# sourceMappingURL=RelayerRequestErrorBase.js.map