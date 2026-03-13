"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerAbortError = void 0;
const RelayerRequestErrorBase_js_1 = require("./RelayerRequestErrorBase.js");
const RelayerErrorBase_js_1 = require("./RelayerErrorBase.js");
class RelayerAbortError extends RelayerRequestErrorBase_js_1.RelayerRequestErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerAbortError",
            message: `${(0, RelayerErrorBase_js_1.humanReadableOperation)(params.operation, true)}: Request aborted`,
        });
    }
}
exports.RelayerAbortError = RelayerAbortError;
//# sourceMappingURL=RelayerAbortError.js.map