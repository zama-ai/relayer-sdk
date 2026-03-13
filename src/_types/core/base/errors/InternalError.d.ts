import { ErrorBase } from "./ErrorBase.js";
export type InternalErrorType = InternalError & {
    name: "InternalError";
};
export type InternalErrorParams = Readonly<{
    message?: string;
}>;
export declare class InternalError extends ErrorBase {
    constructor(params: InternalErrorParams);
}
export declare function assert(condition: boolean, message?: string): asserts condition;
//# sourceMappingURL=InternalError.d.ts.map