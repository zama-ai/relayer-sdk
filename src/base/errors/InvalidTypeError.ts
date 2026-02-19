import type {
  AddressTypeName,
  BytesHexNo0xTypeName,
  BytesHexTypeName,
  BytesTypeName,
  UintBigIntTypeName,
  UintNumberTypeName,
  UintTypeName,
} from '../types/primitives';
import type { ErrorMetadataParams } from './ErrorBase';
import { ErrorBase } from './ErrorBase';

////////////////////////////////////////////////////////////////////////////////

export type ExpectedType =
  | 'non-nullable'
  | 'string'
  | 'boolean'
  | 'number'
  | 'Array'
  | 'Uint8Array'
  | UintTypeName
  | UintNumberTypeName
  | UintBigIntTypeName
  | BytesTypeName
  | BytesHexTypeName
  | BytesHexNo0xTypeName
  | AddressTypeName;

export type SingleExpectedType =
  | ExpectedType
  | `Array<${ExpectedType}>`
  | `${ExpectedType}[]`;

export type ExpectedTypeParams =
  | {
      expectedType: SingleExpectedType | SingleExpectedType[];
      expectedCustomType?: never;
    }
  | {
      expectedType: 'Custom';
      expectedCustomType: string;
    };

////////////////////////////////////////////////////////////////////////////////

export type InvalidTypeErrorType = InvalidTypeError & {
  name: 'InvalidTypeError';
};

////////////////////////////////////////////////////////////////////////////////
// InvalidTypeError
////////////////////////////////////////////////////////////////////////////////

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
export class InvalidTypeError extends ErrorBase {
  constructor(
    {
      subject,
      index,
      type,
      expectedType,
      expectedCustomType,
      metaMessages,
    }: {
      subject?: string | undefined;
      index?: number | undefined;
      type?: string | undefined;
      metaMessages?: string[] | undefined;
    } & ExpectedTypeParams,
    options: ErrorMetadataParams,
  ) {
    const noType =
      type === undefined || type === 'unknown' || type === 'undefined';

    const actualExpectedType =
      expectedType === 'Custom'
        ? expectedCustomType
        : Array.isArray(expectedType)
          ? expectedType.join('|')
          : expectedType;

    let message = '';
    if (subject !== undefined) {
      if (index !== undefined) {
        message += `${subject}[${String(index)}] `;
      } else {
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
      name: 'InvalidTypeError',
      metaMessages,
    });
  }
}
