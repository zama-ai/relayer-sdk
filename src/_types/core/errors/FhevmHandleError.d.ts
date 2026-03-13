import type { FhevmErrorBaseParams } from "./FhevmErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { FhevmErrorBase } from "./FhevmErrorBase.js";
export type FhevmHandleErrorType = FhevmHandleError & {
    name: "FhevmHandleError";
};
export type FhevmHandleErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name"> & {
    handle?: string;
}>;
export declare class FhevmHandleError extends FhevmErrorBase {
    constructor(params: FhevmHandleErrorParams);
}
//# sourceMappingURL=FhevmHandleError.d.ts.map