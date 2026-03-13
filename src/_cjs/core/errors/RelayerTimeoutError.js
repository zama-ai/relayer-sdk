"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerTimeoutError = void 0;
const RelayerRequestErrorBase_js_1 = require("./RelayerRequestErrorBase.js");
const RelayerErrorBase_js_1 = require("./RelayerErrorBase.js");
class RelayerTimeoutError extends RelayerRequestErrorBase_js_1.RelayerRequestErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerTimeoutError",
            message: `${(0, RelayerErrorBase_js_1.humanReadableOperation)(params.operation, true)}: Request timed out after ${params.timeoutMs}ms`,
        });
    }
}
exports.RelayerTimeoutError = RelayerTimeoutError;
//# sourceMappingURL=RelayerTimeoutError.js.map