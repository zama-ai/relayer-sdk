import type { ErrorMetadataParams } from "./ErrorBase.js";
import { ErrorBase } from "./ErrorBase.js";
export type FheTypeErrorType = FheTypeError & {
    name: "FheTypeError";
};
export type FheTypeErrorParams = Readonly<{
    message: string;
}>;
export declare class FheTypeError extends ErrorBase {
    constructor(params: FheTypeErrorParams, options: ErrorMetadataParams);
    static throwFheTypeIdError(id: unknown, options: ErrorMetadataParams): never;
    static throwFheTypeNameError(name: unknown, options: ErrorMetadataParams): never;
}
//# sourceMappingURL=FheTypeError.d.ts.map