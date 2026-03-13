import type { ExpectedTypeParams } from "./InvalidTypeError.js";
import type { ErrorMetadataParams } from "./ErrorBase.js";
import { ErrorBase } from "./ErrorBase.js";
export type InvalidPropertyErrorType = InvalidPropertyError & {
    name: "InvalidPropertyError";
};
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
export declare class InvalidPropertyError extends ErrorBase {
    constructor({ subject, property, index, type, value, expectedValue, expectedType, }: {
        subject: string;
        property: string;
        index?: number | undefined;
        type?: string | undefined;
        value?: string | undefined;
        expectedValue?: string | string[] | undefined;
    } & ExpectedTypeParams, options: ErrorMetadataParams);
}
/**
 * Parameters for creating a missing property error.
 */
export type MissingPropertyParams = {
    subject: string;
    property: string;
    expectedValue?: string | string[] | undefined;
} & ExpectedTypeParams;
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
export declare function missingPropertyError(params: MissingPropertyParams, options: ErrorMetadataParams): InvalidPropertyError;
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
export declare function throwMissingPropertyError(params: MissingPropertyParams, options: ErrorMetadataParams): never;
//# sourceMappingURL=InvalidPropertyError.d.ts.map