import type { FhevmErrorBaseParams } from "./FhevmErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { FhevmErrorBase } from "./FhevmErrorBase.js";
export type InputProofErrorType = InputProofError & {
    name: "InputProofError";
};
export type InputProofErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name">>;
export declare class InputProofError extends FhevmErrorBase {
    constructor(params: InputProofErrorParams);
}
export type TooManyHandlesErrorType = TooManyHandlesError & {
    name: "TooManyHandlesError";
};
export type TooManyHandlesErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name"> & {
    numberOfHandles: number;
}>;
export declare class TooManyHandlesError extends FhevmErrorBase {
    constructor(params: TooManyHandlesErrorParams);
}
//# sourceMappingURL=InputProofError.d.ts.map