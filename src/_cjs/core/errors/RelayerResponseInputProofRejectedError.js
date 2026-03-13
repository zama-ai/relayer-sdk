"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerResponseInputProofRejectedError = void 0;
const RelayerResponseErrorBase_js_1 = require("./RelayerResponseErrorBase.js");
class RelayerResponseInputProofRejectedError extends RelayerResponseErrorBase_js_1.RelayerResponseErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerResponseInputProofRejectedError",
            message: `Relayer rejected the input proof`,
        });
    }
}
exports.RelayerResponseInputProofRejectedError = RelayerResponseInputProofRejectedError;
//# sourceMappingURL=RelayerResponseInputProofRejectedError.js.map