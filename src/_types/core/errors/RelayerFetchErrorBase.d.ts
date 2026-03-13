import type { RelayerErrorBaseParams } from "./RelayerErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { RelayerErrorBase } from "./RelayerErrorBase.js";
import type { RelayerAsyncRequestState, RelayerOperation } from "../types/relayer-p.js";
export type RelayerFetchErrorBaseType = RelayerFetchErrorBase & {
    name: "RelayerFetchErrorBase";
};
export type RelayerFetchErrorBaseParams = Prettify<RelayerErrorBaseParams & {
    readonly fetchMethod: "GET" | "POST";
    readonly url: string;
    readonly operation: RelayerOperation;
    readonly retryCount: number;
    readonly elapsed: number;
    readonly state?: RelayerAsyncRequestState;
    readonly jobId?: string | undefined;
}>;
export declare abstract class RelayerFetchErrorBase extends RelayerErrorBase {
    #private;
    constructor(params: RelayerFetchErrorBaseParams);
    get url(): string;
    get operation(): RelayerOperation;
    get fetchMethod(): "POST" | "GET";
    get jobId(): string | undefined;
    get retryCount(): number;
    get elapsed(): number;
    get state(): RelayerAsyncRequestState | undefined;
    get isAbort(): boolean;
}
//# sourceMappingURL=RelayerFetchErrorBase.d.ts.map