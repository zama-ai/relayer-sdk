export type ErrorBaseType = ErrorBase & {
    name: "ErrorBase";
};
export type ErrorMetadataParams = Readonly<{
    version?: string;
    docsUrl?: string | undefined;
}>;
export type ErrorBaseParams = Readonly<{
    cause?: ErrorBase | Error | undefined;
    message?: string;
    metaMessages?: string[] | undefined;
    details?: string | undefined;
    name?: string | undefined;
} & ErrorMetadataParams>;
export declare abstract class ErrorBase extends Error {
    #private;
    name: string;
    constructor(params: ErrorBaseParams);
    get docsUrl(): string | undefined;
    get details(): string | undefined;
    get version(): string | undefined;
}
//# sourceMappingURL=ErrorBase.d.ts.map