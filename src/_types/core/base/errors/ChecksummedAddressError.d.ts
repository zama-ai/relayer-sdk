import type { ErrorMetadataParams } from "./ErrorBase.js";
import { ErrorBase } from "./ErrorBase.js";
export type ChecksummedAddressErrorType = ChecksummedAddressError & {
    name: "ChecksummedAddressError";
};
export type ChecksummedAddressErrorParams = Readonly<{
    address?: string;
}>;
export declare class ChecksummedAddressError extends ErrorBase {
    constructor(params: ChecksummedAddressErrorParams, options: ErrorMetadataParams);
}
//# sourceMappingURL=ChecksummedAddressError.d.ts.map