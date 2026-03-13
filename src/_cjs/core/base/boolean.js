"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsBoolean = assertIsBoolean;
exports.asBoolean = asBoolean;
exports.toBoolean = toBoolean;
const InvalidTypeError_js_1 = require("./errors/InvalidTypeError.js");
function assertIsBoolean(value, options) {
    if (typeof value !== "boolean") {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "boolean",
        }, options);
    }
}
function asBoolean(value, options) {
    assertIsBoolean(value, options ?? {});
    return value;
}
function toBoolean(value, options) {
    if (typeof value === "boolean")
        return value;
    if (value === 1 || value === 1n || value === "true")
        return true;
    if (value === 0 || value === 0n || value === "false")
        return false;
    throw new InvalidTypeError_js_1.InvalidTypeError({
        subject: options.subject,
        type: typeof value,
        expectedType: "boolean",
    }, options);
}
//# sourceMappingURL=boolean.js.map