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
var _RelayerResponseApiError_relayerApiError;
import { RelayerResponseErrorBase } from "./RelayerResponseErrorBase.js";
import { humanReadableOperation } from "./RelayerErrorBase.js";
/**
 * If the relayer API returns an error response.
 */
export class RelayerResponseApiError extends RelayerResponseErrorBase {
    constructor(params) {
        const metaMessages = [
            `label: ${params.relayerApiError.label}`,
            `message: ${params.relayerApiError.message}`,
        ];
        super({
            ...params,
            metaMessages,
            name: "RelayerResponseApiError",
            message: `${humanReadableOperation(params.operation, true)}: Relayer API error [${params.relayerApiError.label}]: ${params.relayerApiError.message}`,
        });
        _RelayerResponseApiError_relayerApiError.set(this, void 0);
        __classPrivateFieldSet(this, _RelayerResponseApiError_relayerApiError, params.relayerApiError, "f");
    }
    get relayerApiError() {
        return __classPrivateFieldGet(this, _RelayerResponseApiError_relayerApiError, "f");
    }
}
_RelayerResponseApiError_relayerApiError = new WeakMap();
//# sourceMappingURL=RelayerResponseApiError.js.map