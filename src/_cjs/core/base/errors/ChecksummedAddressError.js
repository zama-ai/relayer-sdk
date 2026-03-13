"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecksummedAddressError = void 0;
const ErrorBase_js_1 = require("./ErrorBase.js");
class ChecksummedAddressError extends ErrorBase_js_1.ErrorBase {
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
exports.ChecksummedAddressError = ChecksummedAddressError;
//# sourceMappingURL=ChecksummedAddressError.js.map