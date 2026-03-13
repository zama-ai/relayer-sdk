import type { FhevmErrorBaseParams } from "./FhevmErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { FhevmErrorBase } from "./FhevmErrorBase.js";
export type TFHEErrorType = TFHEError & {
    name: "TFHEError";
};
export type TFHEErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name" | "message"> & {
    readonly message: string;
}>;
export declare class TFHEError extends FhevmErrorBase {
    constructor(params: TFHEErrorParams);
}
//# sourceMappingURL=TFHEError.d.ts.map