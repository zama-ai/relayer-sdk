"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressError = void 0;
const ErrorBase_js_1 = require("./ErrorBase.js");
class AddressError extends ErrorBase_js_1.ErrorBase {
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
exports.AddressError = AddressError;
//# sourceMappingURL=AddressError.js.map