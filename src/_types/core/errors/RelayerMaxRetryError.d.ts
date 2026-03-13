import type { RelayerFetchErrorBaseParams } from "./RelayerFetchErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { RelayerFetchErrorBase } from "./RelayerFetchErrorBase.js";
export type RelayerMaxRetryErrorType = RelayerMaxRetryError & {
    name: "RelayerMaxRetryError";
};
export type RelayerMaxRetryErrorParams = Prettify<Omit<RelayerFetchErrorBaseParams, "name" | "message" | "details">>;
/**
 * The maximum number of retries is exceeded.
 */
export declare class RelayerMaxRetryError extends RelayerFetchErrorBase {
    constructor(params: RelayerMaxRetryErrorParams);
}
//# sourceMappingURL=RelayerMaxRetryError.d.ts.map