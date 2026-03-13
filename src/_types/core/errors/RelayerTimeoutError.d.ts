import type { RelayerRequestErrorBaseParams } from "./RelayerRequestErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { RelayerRequestErrorBase } from "./RelayerRequestErrorBase.js";
export type RelayerTimeoutErrorType = RelayerTimeoutError & {
    name: "RelayerTimeoutError";
};
export type RelayerTimeoutErrorParams = Prettify<Omit<RelayerRequestErrorBaseParams, "message" | "name"> & {
    readonly timeoutMs: number;
}>;
/**
 * The request timed out. (Global)
 */
export declare class RelayerTimeoutError extends RelayerRequestErrorBase {
    constructor(params: RelayerTimeoutErrorParams);
}
//# sourceMappingURL=RelayerTimeoutError.d.ts.map