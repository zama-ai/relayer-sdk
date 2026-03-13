import type { FhevmErrorBaseParams } from "./FhevmErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { FhevmErrorBase } from "./FhevmErrorBase.js";
export type UnknownSignerErrorType = UnknownSignerError & {
    name: "UnknownSignerError";
};
export type UnknownSignerErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name"> & {
    unknownAddress: string;
    type: "coprocessor" | "kms";
}>;
export declare class UnknownSignerError extends FhevmErrorBase {
    constructor(params: UnknownSignerErrorParams);
}
export type ThresholdSignerErrorType = ThresholdSignerError & {
    name: "ThresholdSignerError";
};
export type ThresholdSignerErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name"> & {
    type: "coprocessor" | "kms";
}>;
export declare class ThresholdSignerError extends FhevmErrorBase {
    constructor(params: ThresholdSignerErrorParams);
}
export type DuplicateSignerErrorType = DuplicateSignerError & {
    name: "DuplicateSignerError";
};
export type DuplicateSignerErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name"> & {
    duplicateAddress: string;
    type: "coprocessor" | "kms";
}>;
export declare class DuplicateSignerError extends FhevmErrorBase {
    constructor(params: DuplicateSignerErrorParams);
}
//# sourceMappingURL=SignersError.d.ts.map