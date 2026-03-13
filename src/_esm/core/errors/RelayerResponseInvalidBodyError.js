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
import { RelayerResponseErrorBase } from "./RelayerResponseErrorBase.js";
import { ensureError } from "../base/errors/utils.js";
import { humanReadableOperation } from "./RelayerErrorBase.js";
/**
 * When the response body does not match the expected schema.
 */
export class RelayerResponseInvalidBodyError extends RelayerResponseErrorBase {
    constructor(params) {
        super({
            ...params,
            cause: ensureError(params.cause),
            name: "RelayerResponseInvalidBodyError",
            message: `${humanReadableOperation(params.operation, true)}: Relayer response body does not match the expected schema`,
        });
        _RelayerResponseInvalidBodyError_bodyJson.set(this, void 0);
        __classPrivateFieldSet(this, _RelayerResponseInvalidBodyError_bodyJson, params.bodyJson, "f");
    }
    get bodyJson() {
        return __classPrivateFieldGet(this, _RelayerResponseInvalidBodyError_bodyJson, "f");
    }
}
_RelayerResponseInvalidBodyError_bodyJson = new WeakMap();
//# sourceMappingURL=RelayerResponseInvalidBodyError.js.map