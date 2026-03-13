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
var _RelayerResponseInvalidBodyError_bodyJson;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerResponseInvalidBodyError = void 0;
const RelayerResponseErrorBase_js_1 = require("./RelayerResponseErrorBase.js");
const utils_js_1 = require("../base/errors/utils.js");
const RelayerErrorBase_js_1 = require("./RelayerErrorBase.js");
class RelayerResponseInvalidBodyError extends RelayerResponseErrorBase_js_1.RelayerResponseErrorBase {
    constructor(params) {
        super({
            ...params,
            cause: (0, utils_js_1.ensureError)(params.cause),
            name: "RelayerResponseInvalidBodyError",
            message: `${(0, RelayerErrorBase_js_1.humanReadableOperation)(params.operation, true)}: Relayer response body does not match the expected schema`,
        });
        _RelayerResponseInvalidBodyError_bodyJson.set(this, void 0);
        __classPrivateFieldSet(this, _RelayerResponseInvalidBodyError_bodyJson, params.bodyJson, "f");
    }
    get bodyJson() {
        return __classPrivateFieldGet(this, _RelayerResponseInvalidBodyError_bodyJson, "f");
    }
}
exports.RelayerResponseInvalidBodyError = RelayerResponseInvalidBodyError;
_RelayerResponseInvalidBodyError_bodyJson = new WeakMap();
//# sourceMappingURL=RelayerResponseInvalidBodyError.js.map