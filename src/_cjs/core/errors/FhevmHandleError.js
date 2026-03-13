"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FhevmHandleError = void 0;
const FhevmErrorBase_js_1 = require("./FhevmErrorBase.js");
class FhevmHandleError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            message: params.message ??
                (params.handle !== undefined
                    ? `FHEVM Handle "${params.handle}" is invalid.`
                    : `FHEVM Handle is invalid.`),
            name: "FhevmHandleError",
        });
    }
}
exports.FhevmHandleError = FhevmHandleError;
//# sourceMappingURL=FhevmHandleError.js.map