import type { RelayerFetchErrorBaseParams } from "./RelayerFetchErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { RelayerFetchErrorBase } from "./RelayerFetchErrorBase.js";
export type RelayerResponseErrorBaseType = RelayerResponseErrorBase & {
    name: "RelayerResponseErrorBase";
};
export type RelayerResponseErrorBaseParams = Prettify<RelayerFetchErrorBaseParams & {
    readonly status: number;
}>;
export declare abstract class RelayerResponseErrorBase extends RelayerFetchErrorBase {
    #private;
    constructor(params: RelayerResponseErrorBaseParams);
    get status(): number;
}
//# sourceMappingURL=RelayerResponseErrorBase.d.ts.map