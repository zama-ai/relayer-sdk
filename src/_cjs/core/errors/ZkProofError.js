"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZkProofError = void 0;
const FhevmErrorBase_js_1 = require("./FhevmErrorBase.js");
class ZkProofError extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            message: params.message ?? `FHEVM ZkProof is invalid.`,
            name: "ZkProofError",
        });
    }
}
exports.ZkProofError = ZkProofError;
//# sourceMappingURL=ZkProofError.js.map