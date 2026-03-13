import type { RelayerFetchErrorBaseParams } from "./RelayerFetchErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { RelayerFetchErrorBase } from "./RelayerFetchErrorBase.js";
export type RelayerFetchErrorType = RelayerFetchError & {
    name: "RelayerFetchError";
};
export type RelayerFetchErrorParams = Prettify<Omit<RelayerFetchErrorBaseParams, "cause" | "name"> & {
    readonly cause?: unknown;
    readonly message: string;
}>;
/**
 * If a network error occurs or JSON parsing fails.
 */
export declare class RelayerFetchError extends RelayerFetchErrorBase {
    constructor({ cause, ...params }: RelayerFetchErrorParams);
}
//# sourceMappingURL=RelayerFetchError.d.ts.map