"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPropertyError = void 0;
exports.missingPropertyError = missingPropertyError;
exports.throwMissingPropertyError = throwMissingPropertyError;
const ErrorBase_js_1 = require("./ErrorBase.js");
class InvalidPropertyError extends ErrorBase_js_1.ErrorBase {
    constructor({ subject, property, index, type, value, expectedValue, expectedType, }, options) {
        const missing = type === "undefined";
        const actualExpectedType = Array.isArray(expectedType)
            ? expectedType.join("|")
            : expectedType;
        const actualExpectedValue = expectedValue !== undefined
            ? Array.isArray(expectedValue)
                ? expectedValue.join("|")
                : expectedValue
            : undefined;
        let actualSubject;
        if (property === undefined ||
            property === null ||
            property === "") {
            actualSubject = index !== undefined ? `${subject}[${index}]` : subject;
        }
        else {
            actualSubject =
                index !== undefined
                    ? `${subject}.${property}[${index}]`
                    : `${subject}.${property}`;
        }
        let message;
        if (missing) {
            if (actualExpectedValue !== undefined) {
                message = `missing ${actualSubject}, expected ${actualExpectedValue}`;
            }
            else {
                message = `missing ${actualSubject}, expected ${actualExpectedType}`;
            }
        }
        else {
            message = actualSubject;
            const noType = type === undefined || type === "unknown" || type === "undefined";
            const typeMatchesExpected = type !== undefined &&
                (Array.isArray(expectedType)
                    ? expectedType.includes(type)
                    : type === expectedType);
            const unexpectedTypeError = actualExpectedValue === undefined &&
                value === undefined &&
                (noType || !typeMatchesExpected);
            if (unexpectedTypeError) {
                message += ` has unexpected type, expected ${actualExpectedType}`;
                if (!noType) {
                    message += `, got ${type}`;
                }
            }
            else if (value !== undefined) {
                if (actualExpectedValue !== undefined) {
                    message += ` has unexpected value '${value}', expected '${actualExpectedValue}'`;
                }
                else {
                    message = `${actualSubject} is invalid. '${value}' is not a valid ${actualExpectedType}`;
                }
            }
            else if (actualExpectedValue !== undefined) {
                message += ` has unexpected value, expected '${actualExpectedValue}'`;
            }
            else {
                message += ` is invalid, expected valid ${actualExpectedType}`;
            }
        }
        super({
            ...options,
            message,
            name: "InvalidPropertyError",
        });
    }
}
exports.InvalidPropertyError = InvalidPropertyError;
function missingPropertyError(params, options) {
    return new InvalidPropertyError({ ...params, type: "undefined" }, options);
}
function throwMissingPropertyError(params, options) {
    throw missingPropertyError(params, options);
}
//# sourceMappingURL=InvalidPropertyError.js.map