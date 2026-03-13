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
var _RelayerRequestInternalError_status, _RelayerRequestInternalError_state;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerRequestInternalError = void 0;
const RelayerRequestErrorBase_js_1 = require("./RelayerRequestErrorBase.js");
const RelayerErrorBase_js_1 = require("./RelayerErrorBase.js");
class RelayerRequestInternalError extends RelayerRequestErrorBase_js_1.RelayerRequestErrorBase {
    constructor(params) {
        const metaMessages = [
            ...(params.metaMessages ?? []),
            ...(params.status !== undefined ? [`status: ${params.status}`] : []),
            ...(params.state !== undefined ? [`state: ${params.state}`] : []),
        ];
        super({
            ...params,
            metaMessages,
            name: "RelayerRequestInternalError",
            message: params.message ??
                `${(0, RelayerErrorBase_js_1.humanReadableOperation)(params.operation, true)}: Relayer SDK internal error`,
        });
        _RelayerRequestInternalError_status.set(this, void 0);
        _RelayerRequestInternalError_state.set(this, void 0);
        __classPrivateFieldSet(this, _RelayerRequestInternalError_status, params.status, "f");
        __classPrivateFieldSet(this, _RelayerRequestInternalError_state, params.state, "f");
    }
    get status() {
        return __classPrivateFieldGet(this, _RelayerRequestInternalError_status, "f");
    }
    get state() {
        return __classPrivateFieldGet(this, _RelayerRequestInternalError_state, "f");
    }
}
exports.RelayerRequestInternalError = RelayerRequestInternalError;
_RelayerRequestInternalError_status = new WeakMap(), _RelayerRequestInternalError_state = new WeakMap();
//# sourceMappingURL=RelayerRequestInternalError.js.map