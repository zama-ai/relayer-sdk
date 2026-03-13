import type { Prettify } from "../types/utils.js";
import type { RelayerResponseErrorBaseParams } from "./RelayerResponseErrorBase.js";
import { RelayerResponseErrorBase } from "./RelayerResponseErrorBase.js";
export type RelayerResponseInputProofRejectedErrorType = RelayerResponseInputProofRejectedError & {
    name: "RelayerResponseInputProofRejectedError";
};
export type RelayerResponseInputProofRejectedErrorParams = Prettify<Omit<RelayerResponseErrorBaseParams, "name" | "message">>;
/**
 * The input proof is rejected.
 */
export declare class RelayerResponseInputProofRejectedError extends RelayerResponseErrorBase {
    constructor(params: RelayerResponseInputProofRejectedErrorParams);
}
//# sourceMappingURL=RelayerResponseInputProofRejectedError.d.ts.map