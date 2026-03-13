"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateSignerError = exports.ThresholdSignerError = exports.UnknownSignerError = void 0;
const FhevmErrorBase_js_1 = require("./FhevmErrorBase.js");
class UnknownSignerError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "UnknownSignerError",
            message: `Invalid address found: ${params.unknownAddress} is not in the list of ${params.type} signers`,
        });
    }
}
exports.UnknownSignerError = UnknownSignerError;
class ThresholdSignerError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "ThresholdSignerError",
            message: `${params.type} signers threshold is not reached`,
        });
    }
}
exports.ThresholdSignerError = ThresholdSignerError;
class DuplicateSignerError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "DuplicateSignerError",
            message: `Duplicate ${params.type} signer address found: ${params.duplicateAddress} appears multiple times in recovered addresses`,
        });
    }
}
exports.DuplicateSignerError = DuplicateSignerError;
//# sourceMappingURL=SignersError.js.map