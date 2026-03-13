"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = void 0;
exports.assert = assert;
const ErrorBase_js_1 = require("./ErrorBase.js");
class InternalError extends ErrorBase_js_1.ErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "InternalError",
            message: params.message ?? "internal error",
        });
    }
}
exports.InternalError = InternalError;
function assert(condition, message) {
    if (!condition) {
        throw new InternalError({ message: message ?? "Assertion failed" });
    }
}
//# sourceMappingURL=InternalError.js.map