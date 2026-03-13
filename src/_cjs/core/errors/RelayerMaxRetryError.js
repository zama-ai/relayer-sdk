"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerMaxRetryError = void 0;
const RelayerFetchErrorBase_js_1 = require("./RelayerFetchErrorBase.js");
const RelayerErrorBase_js_1 = require("./RelayerErrorBase.js");
class RelayerMaxRetryError extends RelayerFetchErrorBase_js_1.RelayerFetchErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerMaxRetryError",
            message: `${(0, RelayerErrorBase_js_1.humanReadableOperation)(params.operation, true)}: Maximum polling retry limit exceeded (${params.retryCount} attempts)`,
            details: `After ${params.retryCount} polling attempts, the retry limit was exceeded. The operation may still complete on the server - consider checking the result later.`,
        });
    }
}
exports.RelayerMaxRetryError = RelayerMaxRetryError;
//# sourceMappingURL=RelayerMaxRetryError.js.map