import type { RelayerRequestErrorBaseParams } from "./RelayerRequestErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { RelayerRequestErrorBase } from "./RelayerRequestErrorBase.js";
export type RelayerInternalRequestErrorType = RelayerRequestInternalError & {
    name: "RelayerRequestInternalError";
};
export type RelayerInternalRequestErrorParams = Prettify<Omit<RelayerRequestErrorBaseParams, "name"> & {
    readonly status?: number;
    readonly state?: string;
}>;
/**
 * Internal error
 */
export declare class RelayerRequestInternalError extends RelayerRequestErrorBase {
    #private;
    constructor(params: RelayerInternalRequestErrorParams);
    get status(): number | undefined;
    get state(): string | undefined;
}
//# sourceMappingURL=RelayerRequestInternalError.d.ts.map