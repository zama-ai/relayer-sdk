import type { RelayerErrorBaseParams } from "./RelayerErrorBase.js";
import type { Prettify } from "../types/utils.js";
import type { RelayerOperation } from "../types/relayer-p.js";
import { RelayerErrorBase } from "./RelayerErrorBase.js";
export type RelayerRequestErrorBaseType = RelayerRequestErrorBase & {
    name: "RelayerRequestErrorBase";
};
export type RelayerRequestErrorBaseParams = Prettify<RelayerErrorBaseParams & {
    readonly url: string;
    readonly operation: RelayerOperation;
    readonly jobId?: string | undefined;
}>;
export declare abstract class RelayerRequestErrorBase extends RelayerErrorBase {
    #private;
    constructor(params: RelayerRequestErrorBaseParams);
    get url(): string;
    get jobId(): string | undefined;
    get operation(): RelayerOperation;
}
//# sourceMappingURL=RelayerRequestErrorBase.d.ts.map