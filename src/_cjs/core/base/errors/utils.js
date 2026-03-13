"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureError = ensureError;
exports.assertNever = assertNever;
exports.getErrorMessage = getErrorMessage;
const InternalError_js_1 = require("./InternalError.js");
function ensureError(e) {
    if (e instanceof Error) {
        return e;
    }
    const message = e.message ??
        "Non-Error value caught in exception handler";
    const name = e.name ?? "ErrorWrapper";
    const cause = e.cause ?? e;
    const err = new Error(message, { cause });
    err.name = name;
    return err;
}
function assertNever(_value, message) {
    throw new InternalError_js_1.InternalError({ message });
}
function getErrorMessage(e) {
    let msg;
    if (typeof e === "string") {
        msg = e;
    }
    else if (e instanceof Error) {
        msg = e.message;
    }
    else {
        msg = String(e);
    }
    while (msg.startsWith('"') || msg.startsWith("'")) {
        msg = msg.slice(1);
    }
    while (msg.endsWith('"') || msg.endsWith("'")) {
        msg = msg.slice(0, -1);
    }
    return msg;
}
//# sourceMappingURL=utils.js.map