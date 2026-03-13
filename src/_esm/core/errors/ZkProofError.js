import { FhevmErrorBase } from "./FhevmErrorBase.js";
export class ZkProofError extends FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            message: params.message ?? `FHEVM ZkProof is invalid.`,
            name: "ZkProofError",
        });
    }
}
//# sourceMappingURL=ZkProofError.js.map