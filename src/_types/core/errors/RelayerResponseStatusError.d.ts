import type { Prettify } from "../types/utils.js";
import type { RelayerAsyncRequestState } from "../types/relayer-p.js";
import type { RelayerResponseErrorBaseParams } from "./RelayerResponseErrorBase.js";
import { RelayerResponseErrorBase } from "./RelayerResponseErrorBase.js";
export type RelayerResponseStatusErrorType = RelayerResponseStatusError & {
    name: "RelayerResponseStatusError";
};
export type RelayerResponseStatusErrorParams = Prettify<Omit<RelayerResponseErrorBaseParams, "message" | "name" | "details"> & {
    readonly state: RelayerAsyncRequestState;
}>;
/**
 * The response status is unexpected.
 */
export declare class RelayerResponseStatusError extends RelayerResponseErrorBase {
    constructor(params: RelayerResponseStatusErrorParams);
}
//# sourceMappingURL=RelayerResponseStatusError.d.ts.map