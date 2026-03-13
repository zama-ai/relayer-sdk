import type { Prettify } from "../types/utils.js";
import type { ErrorBaseParams } from "../base/errors/ErrorBase.js";
import type { RelayerOperation } from "../types/relayer-p.js";
import { ErrorBase } from "../base/errors/ErrorBase.js";
export type RelayerErrorBaseType = RelayerErrorBase & {
    name: "RelayerErrorBase";
};
export type RelayerErrorBaseParams = Prettify<Omit<ErrorBaseParams, "docsUrl" | "name" | "version"> & {
    readonly docsPath?: string;
    readonly docsSlug?: string;
    readonly name: string;
}>;
export declare abstract class RelayerErrorBase extends ErrorBase {
    #private;
    private static readonly PKG_NAME;
    private static readonly VERSION;
    private static readonly DEFAULT_DOCS_BASE_URL;
    private static readonly FULL_VERSION;
    constructor(params: RelayerErrorBaseParams);
    get docsPath(): string | undefined;
}
export declare function humanReadableOperation(relayerOperation: RelayerOperation, capitalize: boolean): string;
//# sourceMappingURL=RelayerErrorBase.d.ts.map