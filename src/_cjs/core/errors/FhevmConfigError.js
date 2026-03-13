"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FhevmConfigError = void 0;
const FhevmErrorBase_js_1 = require("./FhevmErrorBase.js");
class FhevmConfigError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "FhevmConfigError",
        });
    }
}
exports.FhevmConfigError = FhevmConfigError;
//# sourceMappingURL=FhevmConfigError.js.map