"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionError = void 0;
const FhevmErrorBase_js_1 = require("./FhevmErrorBase.js");
class EncryptionError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "EncryptionError",
        });
    }
}
exports.EncryptionError = EncryptionError;
//# sourceMappingURL=EncryptionError.js.map