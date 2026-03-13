"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerResponseStatusError = void 0;
const RelayerErrorBase_js_1 = require("./RelayerErrorBase.js");
const RelayerResponseErrorBase_js_1 = require("./RelayerResponseErrorBase.js");
class RelayerResponseStatusError extends RelayerResponseErrorBase_js_1.RelayerResponseErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerResponseStatusError",
            message: `${(0, RelayerErrorBase_js_1.humanReadableOperation)(params.operation, true)}: Relayer returned unexpected response status: ${params.status}`,
            details: `The Relayer server returned an unexpected response status (${params.status}). This status ${params.status} is not part of the expected API contract and may indicate a server configuration issue.`,
        });
    }
}
exports.RelayerResponseStatusError = RelayerResponseStatusError;
//# sourceMappingURL=RelayerResponseStatusError.js.map