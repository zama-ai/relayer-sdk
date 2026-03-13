import type { Prettify } from "../types/utils.js";
import type { ErrorBaseParams } from "../base/errors/ErrorBase.js";
import { ErrorBase } from "../base/errors/ErrorBase.js";
export type FhevmErrorBaseType = FhevmErrorBase & {
    name: "FhevmErrorBase";
};
export type FhevmErrorBaseParams = Prettify<Omit<ErrorBaseParams, "docsUrl" | "name" | "version"> & {
    readonly docsPath?: string;
    readonly docsSlug?: string;
    readonly name: string;
}>;
export declare abstract class FhevmErrorBase extends ErrorBase {
    #private;
    private static readonly PKG_NAME;
    private static readonly VERSION;
    private static readonly DEFAULT_DOCS_BASE_URL;
    private static readonly FULL_VERSION;
    constructor(params: FhevmErrorBaseParams);
    get docsPath(): string | undefined;
}
//# sourceMappingURL=FhevmErrorBase.d.ts.map