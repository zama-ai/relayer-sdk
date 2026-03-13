import { ErrorBase } from "./ErrorBase.js";
export class ChecksummedAddressError extends ErrorBase {
    constructor(params, options) {
        super({
            ...options,
            message: params.address !== undefined
                ? `Checksummed address "${params.address}" is invalid.`
                : "Checksummed address is invalid.",
            name: "ChecksummedAddressError",
        });
    }
}
//# sourceMappingURL=ChecksummedAddressError.js.map