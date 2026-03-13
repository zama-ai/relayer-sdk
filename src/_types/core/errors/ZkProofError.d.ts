import type { FhevmErrorBaseParams } from "./FhevmErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { FhevmErrorBase } from "./FhevmErrorBase.js";
export type ZkProofErrorType = ZkProofError & {
    name: "ZkProofError";
};
export type ZkProofErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name">>;
export declare class ZkProofError extends FhevmErrorBase {
    constructor(params: ZkProofErrorParams);
}
//# sourceMappingURL=ZkProofError.d.ts.map