import type { Prettify } from "../types/utils.js";
import type { RelayerAsyncRequestState } from "../types/relayer-p.js";
import type { RelayerErrorBaseParams } from "./RelayerErrorBase.js";
import { RelayerErrorBase } from "./RelayerErrorBase.js";
export type RelayerStateErrorType = RelayerErrorBase & {
    name: "RelayerStateError";
};
export type RelayerStateErrorParams = Prettify<Omit<RelayerErrorBaseParams, "name"> & {
    readonly state: RelayerAsyncRequestState;
    readonly message: string;
}>;
/**
 * The request cannot run (already terminated, canceled, succeeded, failed, aborted, or running).
 */
export declare class RelayerStateError extends RelayerErrorBase {
    #private;
    constructor(params: RelayerStateErrorParams);
    get state(): RelayerAsyncRequestState;
}
//# sourceMappingURL=RelayerStateError.d.ts.map