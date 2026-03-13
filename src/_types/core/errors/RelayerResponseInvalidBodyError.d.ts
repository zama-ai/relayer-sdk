import type { Prettify } from "../types/utils.js";
import type { RelayerResponseErrorBaseParams } from "./RelayerResponseErrorBase.js";
import type { InvalidPropertyError } from "../base/errors/InvalidPropertyError.js";
import { RelayerResponseErrorBase } from "./RelayerResponseErrorBase.js";
export type RelayerResponseInvalidBodyErrorType = RelayerResponseInvalidBodyError & {
    name: "RelayerResponseInvalidBodyError";
};
export type RelayerResponseInvalidBodyErrorParams = Prettify<Omit<RelayerResponseErrorBaseParams, "cause" | "name" | "message"> & {
    readonly cause: InvalidPropertyError;
    readonly bodyJson: string;
}>;
/**
 * When the response body does not match the expected schema.
 */
export declare class RelayerResponseInvalidBodyError extends RelayerResponseErrorBase {
    #private;
    constructor(params: RelayerResponseInvalidBodyErrorParams);
    get bodyJson(): string;
}
//# sourceMappingURL=RelayerResponseInvalidBodyError.d.ts.map