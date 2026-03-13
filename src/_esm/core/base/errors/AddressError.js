import { ErrorBase } from "./ErrorBase.js";
export class AddressError extends ErrorBase {
    constructor(params, options) {
        super({
            ...options,
            message: params.address !== undefined
                ? `Address "${params.address}" is invalid.`
                : "Address is invalid.",
            name: "AddressError",
        });
    }
}
//# sourceMappingURL=AddressError.js.map