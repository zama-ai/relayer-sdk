"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyHandlesError = exports.InputProofError = void 0;
const FhevmErrorBase_js_1 = require("./FhevmErrorBase.js");
class InputProofError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            message: params.message ?? `FHEVM InputProof is invalid.`,
            name: "InputProofError",
        });
    }
}
exports.InputProofError = InputProofError;
class TooManyHandlesError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "TooManyHandlesError",
            message: `Trying to pack ${params.numberOfHandles} handles. Packing more than 256 variables in a single input ciphertext is unsupported`,
        });
    }
}
exports.TooManyHandlesError = TooManyHandlesError;
//# sourceMappingURL=InputProofError.js.map