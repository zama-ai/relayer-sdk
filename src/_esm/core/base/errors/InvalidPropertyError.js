import { ErrorBase } from "./ErrorBase.js";
////////////////////////////////////////////////////////////////////////////////
// InvalidPropertyError
////////////////////////////////////////////////////////////////////////////////
/**
 * Error thrown when an object property is invalid, missing, or has an unexpected value.
 *
 * @example
 * ```ts
 * // Missing property (type: 'undefined')
 * throw new InvalidPropertyError({
 *   subject: 'config',
 *   property: 'timeout',
 *   type: 'undefined',
 *   expectedType: 'number',
 * });
 * // => "missing config.timeout, expected number"
 *
 * // Type mismatch
 * throw new InvalidPropertyError({
 *   subject: 'config',
 *   property: 'timeout',
 *   expectedType: 'number',
 *   type: 'string',
 * });
 * // => "config.timeout has unexpected type, expected number, got string"
 *
 * // Invalid value (type matches but value is wrong)
 * throw new InvalidPropertyError({
 *   subject: 'config',
 *   property: 'retries',
 *   type: 'number',
 *   expectedType: 'number',
 *   value: '-1',
 * });
 * // => "config.retries is invalid. '-1' is not a valid number"
 *
 * // Unexpected value with expected value
 * throw new InvalidPropertyError({
 *   subject: 'config',
 *   property: 'mode',
 *   type: 'string',
 *   expectedType: 'string',
 *   value: 'invalid',
 *   expectedValue: ['production', 'development'],
 * });
 * // => "config.mode has unexpected value 'invalid', expected 'production|development'"
 *
 * // Array index
 * throw new InvalidPropertyError({
 *   subject: 'config',
 *   property: 'addresses',
 *   index: 2,
 *   expectedType: 'Address',
 *   type: 'number',
 * });
 * // => "config.addresses[2] has unexpected type, expected Address, got number"
 *
 * // Using standalone helper
 * throw missingPropertyError({
 *   subject: 'config',
 *   property: 'apiKey',
 *   expectedType: 'string',
 * }, {});
 * // => "missing config.apiKey, expected string"
 * ```
 */
export class InvalidPropertyError extends ErrorBase {
    constructor({ subject, property, index, type, value, expectedValue, expectedType, }, options) {
        /*
        Missing property:
          - missing {subject}, expected {expectedType}
          - missing {subject}, expected {expectedValue}
        Type error (no value provided, type mismatch):
          - {subject} has unexpected type, expected {expectedType}
          - {subject} has unexpected type, expected {expectedType}, got {type}
        Value error (value provided, no expectedValue):
          - {subject} is invalid. '{value}' is not a valid {expectedType}
        Value mismatch (expectedValue provided):
          - {subject} has unexpected value, expected '{expectedValue}'
          - {subject} has unexpected value '{value}', expected '{expectedValue}'
        Fallback (type matches, no value info):
          - {subject} is invalid, expected valid {expectedType}
        */
        // The property is flagged as 'missing' if 'type' is set to 'undefined'
        const missing = type === "undefined";
        // Compute expected type
        const actualExpectedType = Array.isArray(expectedType)
            ? expectedType.join("|")
            : expectedType;
        // Compute expected value
        const actualExpectedValue = expectedValue !== undefined
            ? Array.isArray(expectedValue)
                ? expectedValue.join("|")
                : expectedValue
            : undefined;
        // Compute subject
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
        // Build message
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
            // Type error: no value/expectedValue provided AND (no type OR type mismatch)
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
                // Value provided - check if it's a type mismatch or invalid value
                if (actualExpectedValue !== undefined) {
                    message += ` has unexpected value '${value}', expected '${actualExpectedValue}'`;
                }
                else {
                    // Invalid value for the expected type
                    message = `${actualSubject} is invalid. '${value}' is not a valid ${actualExpectedType}`;
                }
            }
            else if (actualExpectedValue !== undefined) {
                // No value but expectedValue provided
                message += ` has unexpected value, expected '${actualExpectedValue}'`;
            }
            else {
                // No value, no expectedValue, type matches - shouldn't happen in practice
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
/**
 * Creates an InvalidPropertyError for a missing property.
 *
 * @example
 * ```ts
 * const error = missingPropertyError({
 *   subject: 'config',
 *   property: 'apiKey',
 *   expectedType: 'string',
 * }, {});
 * // error.message => "missing config.apiKey, expected string"
 * ```
 */
export function missingPropertyError(params, options) {
    return new InvalidPropertyError({ ...params, type: "undefined" }, options);
}
/**
 * Throws an InvalidPropertyError for a missing property.
 *
 * @example
 * ```ts
 * throw throwMissingPropertyError({
 *   subject: 'config',
 *   property: 'apiKey',
 *   expectedType: 'string',
 * }, {});
 * // => throws "missing config.apiKey, expected string"
 * ```
 */
export function throwMissingPropertyError(params, options) {
    throw missingPropertyError(params, options);
}
//# sourceMappingURL=InvalidPropertyError.js.map