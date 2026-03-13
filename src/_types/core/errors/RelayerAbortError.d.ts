import type { Prettify } from "../types/utils.js";
import type { RelayerRequestErrorBaseParams } from "./RelayerRequestErrorBase.js";
import { RelayerRequestErrorBase } from "./RelayerRequestErrorBase.js";
export type RelayerAbortErrorType = RelayerAbortError & {
    name: "RelayerAbortError";
};
export type RelayerAbortErrorParams = Prettify<Omit<RelayerRequestErrorBaseParams, "name" | "message">>;
/**
 * Request was aborted.
 */
export declare class RelayerAbortError extends RelayerRequestErrorBase {
    constructor(params: RelayerAbortErrorParams);
}
//# sourceMappingURL=RelayerAbortError.d.ts.map