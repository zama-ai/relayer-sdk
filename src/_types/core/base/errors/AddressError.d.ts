import type { ErrorMetadataParams } from "./ErrorBase.js";
import { ErrorBase } from "./ErrorBase.js";
export type AddressErrorType = AddressError & {
    name: "AddressError";
};
export type AddressErrorParams = Readonly<{
    address?: string;
}>;
export declare class AddressError extends ErrorBase {
    constructor(params: AddressErrorParams, options: ErrorMetadataParams);
}
//# sourceMappingURL=AddressError.d.ts.map