import { FhevmErrorBase } from "./FhevmErrorBase.js";
export class InputProofError extends FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            message: params.message ?? `FHEVM InputProof is invalid.`,
            name: "InputProofError",
        });
    }
}
export class TooManyHandlesError extends FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "TooManyHandlesError",
            message: `Trying to pack ${params.numberOfHandles} handles. Packing more than 256 variables in a single input ciphertext is unsupported`,
        });
    }
}
//# sourceMappingURL=InputProofError.js.map