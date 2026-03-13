"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TFHEError = void 0;
const FhevmErrorBase_js_1 = require("./FhevmErrorBase.js");
class TFHEError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "TFHEError",
        });
    }
}
exports.TFHEError = TFHEError;
//# sourceMappingURL=TFHEError.js.map