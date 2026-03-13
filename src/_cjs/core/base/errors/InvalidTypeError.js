"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTypeError = void 0;
const ErrorBase_js_1 = require("./ErrorBase.js");
class InvalidTypeError extends ErrorBase_js_1.ErrorBase {
    constructor({ subject, index, type, expectedType, metaMessages, }, options) {
        const noType = type === undefined || type === "unknown" || type === "undefined";
        const actualExpectedType = Array.isArray(expectedType)
            ? expectedType.join("|")
            : expectedType;
        let message = "";
        if (subject !== undefined) {
            if (index !== undefined) {
                message += `${subject}[${String(index)}] `;
            }
            else {
                message += `${subject} `;
            }
        }
        message += `expected ${actualExpectedType}`;
        if (!noType) {
            message += `, got ${type}`;
        }
        super({
            ...options,
            message,
            name: "InvalidTypeError",
            metaMessages,
        });
    }
}
exports.InvalidTypeError = InvalidTypeError;
//# sourceMappingURL=InvalidTypeError.js.map