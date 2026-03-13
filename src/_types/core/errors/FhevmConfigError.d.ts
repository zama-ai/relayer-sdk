import type { FhevmErrorBaseParams } from "./FhevmErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { FhevmErrorBase } from "./FhevmErrorBase.js";
export type FhevmConfigErrorType = FhevmConfigError & {
    name: "FhevmConfigError";
};
export type FhevmConfigErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name">>;
export declare class FhevmConfigError extends FhevmErrorBase {
    constructor(params: FhevmConfigErrorParams);
}
//# sourceMappingURL=FhevmConfigError.d.ts.map