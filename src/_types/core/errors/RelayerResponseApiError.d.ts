import type { Prettify } from "../types/utils.js";
import type { RelayerResponseErrorBaseParams } from "./RelayerResponseErrorBase.js";
import type { RelayerApiError } from "../types/relayer-p.js";
import { RelayerResponseErrorBase } from "./RelayerResponseErrorBase.js";
export type RelayerResponseApiErrorType = RelayerResponseErrorBase & {
    name: "RelayerResponseApiError";
};
export type RelayerResponseApiErrorParams = Prettify<Omit<RelayerResponseErrorBaseParams, "metaMessages" | "name" | "message"> & {
    readonly relayerApiError: RelayerApiError;
}>;
/**
 * If the relayer API returns an error response.
 */
export declare class RelayerResponseApiError extends RelayerResponseErrorBase {
    #private;
    constructor(params: RelayerResponseApiErrorParams);
    get relayerApiError(): RelayerApiError;
}
//# sourceMappingURL=RelayerResponseApiError.d.ts.map