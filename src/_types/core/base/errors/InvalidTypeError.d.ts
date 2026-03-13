import type { ErrorMetadataParams } from "./ErrorBase.js";
import { ErrorBase } from "./ErrorBase.js";
export type ExpectedTypeParams = {
    expectedType: string | string[];
};
export type InvalidTypeErrorType = InvalidTypeError & {
    name: "InvalidTypeError";
};
/**
 * Error thrown when a value does not match its expected type.
 *
 * @example
 * ```ts
 * // With subject and actual type
 * throw new InvalidTypeError({
 *   subject: 'first argument of encrypt()',
 *   expectedType: 'Uint8Array',
 *   type: typeof value,
 * });
 * // => "first argument of encrypt() expected Uint8Array, got string"
 *
 * // Without subject
 * throw new InvalidTypeError({ expectedType: 'ChecksummedAddress' });
 * // => "expected ChecksummedAddress"
 *
 * // With custom type
 * throw new InvalidTypeError({
 *   subject: 'config.timeout',
 *   expectedType: 'Custom',
 *   expectedCustomType: 'positive integer',
 *   type: 'number',
 * });
 * // => "config.timeout expected positive integer, got number"
 * ```
 */
export declare class InvalidTypeError extends ErrorBase {
    constructor({ subject, index, type, expectedType, metaMessages, }: {
        subject?: string | undefined;
        index?: number | undefined;
        type?: string | undefined;
        metaMessages?: string[] | undefined;
    } & ExpectedTypeParams, options: ErrorMetadataParams);
}
//# sourceMappingURL=InvalidTypeError.d.ts.map