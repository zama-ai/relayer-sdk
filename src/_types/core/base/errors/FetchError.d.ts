import { ErrorBase } from "./ErrorBase.js";
export type FetchErrorType = FetchError & {
    name: "FetchError";
};
export type FetchErrorParams = Readonly<{
    url: string;
    message?: string;
}>;
export declare class FetchError extends ErrorBase {
    #private;
    constructor(params: FetchErrorParams);
    get url(): string;
}
//# sourceMappingURL=FetchError.d.ts.map