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
var _RelayerFetchErrorBase_fetchMethod, _RelayerFetchErrorBase_url, _RelayerFetchErrorBase_jobId, _RelayerFetchErrorBase_operation, _RelayerFetchErrorBase_retryCount, _RelayerFetchErrorBase_elapsed, _RelayerFetchErrorBase_state;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerFetchErrorBase = void 0;
const RelayerErrorBase_js_1 = require("./RelayerErrorBase.js");
class RelayerFetchErrorBase extends RelayerErrorBase_js_1.RelayerErrorBase {
    constructor(params) {
        const metaMessages = [
            ...(params.metaMessages ?? []),
            `url: ${params.url}`,
            `method: ${params.fetchMethod}`,
            `operation: ${params.operation}`,
            `retryCount: ${params.retryCount}`,
            ...(params.jobId !== undefined ? [`jobId: ${params.jobId}`] : []),
        ];
        super({
            ...params,
            metaMessages,
            name: params.name,
        });
        _RelayerFetchErrorBase_fetchMethod.set(this, void 0);
        _RelayerFetchErrorBase_url.set(this, void 0);
        _RelayerFetchErrorBase_jobId.set(this, void 0);
        _RelayerFetchErrorBase_operation.set(this, void 0);
        _RelayerFetchErrorBase_retryCount.set(this, void 0);
        _RelayerFetchErrorBase_elapsed.set(this, void 0);
        _RelayerFetchErrorBase_state.set(this, void 0);
        __classPrivateFieldSet(this, _RelayerFetchErrorBase_fetchMethod, params.fetchMethod, "f");
        __classPrivateFieldSet(this, _RelayerFetchErrorBase_url, params.url, "f");
        __classPrivateFieldSet(this, _RelayerFetchErrorBase_operation, params.operation, "f");
        __classPrivateFieldSet(this, _RelayerFetchErrorBase_elapsed, params.elapsed, "f");
        __classPrivateFieldSet(this, _RelayerFetchErrorBase_retryCount, params.retryCount, "f");
        __classPrivateFieldSet(this, _RelayerFetchErrorBase_state, params.state, "f");
        __classPrivateFieldSet(this, _RelayerFetchErrorBase_jobId, params.jobId, "f");
    }
    get url() {
        return __classPrivateFieldGet(this, _RelayerFetchErrorBase_url, "f");
    }
    get operation() {
        return __classPrivateFieldGet(this, _RelayerFetchErrorBase_operation, "f");
    }
    get fetchMethod() {
        return __classPrivateFieldGet(this, _RelayerFetchErrorBase_fetchMethod, "f");
    }
    get jobId() {
        return __classPrivateFieldGet(this, _RelayerFetchErrorBase_jobId, "f");
    }
    get retryCount() {
        return __classPrivateFieldGet(this, _RelayerFetchErrorBase_retryCount, "f");
    }
    get elapsed() {
        return __classPrivateFieldGet(this, _RelayerFetchErrorBase_elapsed, "f");
    }
    get state() {
        return __classPrivateFieldGet(this, _RelayerFetchErrorBase_state, "f");
    }
    get isAbort() {
        return this.cause !== undefined
            ? this.cause.name === "AbortError"
            : false;
    }
}
exports.RelayerFetchErrorBase = RelayerFetchErrorBase;
_RelayerFetchErrorBase_fetchMethod = new WeakMap(), _RelayerFetchErrorBase_url = new WeakMap(), _RelayerFetchErrorBase_jobId = new WeakMap(), _RelayerFetchErrorBase_operation = new WeakMap(), _RelayerFetchErrorBase_retryCount = new WeakMap(), _RelayerFetchErrorBase_elapsed = new WeakMap(), _RelayerFetchErrorBase_state = new WeakMap();
//# sourceMappingURL=RelayerFetchErrorBase.js.map