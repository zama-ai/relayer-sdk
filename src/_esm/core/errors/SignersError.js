import { FhevmErrorBase } from "./FhevmErrorBase.js";
export class UnknownSignerError extends FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "UnknownSignerError",
            message: `Invalid address found: ${params.unknownAddress} is not in the list of ${params.type} signers`,
        });
    }
}
export class ThresholdSignerError extends FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "ThresholdSignerError",
            message: `${params.type} signers threshold is not reached`,
        });
    }
}
export class DuplicateSignerError extends FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "DuplicateSignerError",
            message: `Duplicate ${params.type} signer address found: ${params.duplicateAddress} appears multiple times in recovered addresses`,
        });
    }
}
//# sourceMappingURL=SignersError.js.map