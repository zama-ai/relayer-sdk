import { RelayerBaseError } from './RelayerBaseError';

export type InvalidPropertyErrorType = InvalidPropertyError & {
  name: 'InvalidPropertyError';
};

type ExpectedType =
  | 'string'
  | 'boolean'
  | 'non-nullable'
  | 'Uint'
  | 'Array'
  | 'ChecksummedAddress'
  | 'Bytes32Hex'
  | 'BytesHexNo0x'
  | 'Uint8Array'
  | 'BytesHex'
  | 'Timestamp'
  | 'unknown';

export class InvalidPropertyError extends RelayerBaseError {
  readonly _objName: string;
  readonly _property: string;
  readonly _expectedType: string;
  readonly _index?: number | undefined;
  readonly _value?: string | undefined;
  readonly _type?: string | undefined;
  readonly _expectedValue?: string | string[] | undefined;
  constructor({
    objName,
    property,
    index,
    type,
    value,
    expectedValue,
    expectedType,
  }: {
    objName: string;
    property: string;
    index?: number;
    type?: string;
    value?: string;
    expectedValue?: string | string[];
    expectedType: ExpectedType;
  }) {
    let message =
      index !== undefined
        ? `InvalidPropertyError ${objName}.${property}[${index}]`
        : `InvalidPropertyError ${objName}.${property}`;
    if (type === expectedType) {
      if (value !== undefined) {
        message += ` unexpected value ${value}`;
      }
    } else {
      if (type === 'undefined' && expectedValue !== undefined) {
        if (Array.isArray(expectedValue)) {
          expectedValue = expectedValue.join('|');
        }
        message += ` expected value ${expectedValue}`;
      } else if (expectedType !== 'unknown' && type !== 'unknown') {
        message += ` not a ${expectedType}`;
        if (type) {
          message += `, type is ${type}`;
        }
      }
    }
    super({
      message,
      name: 'InvalidPropertyError',
    });
    this._objName = objName;
    this._property = property;
    this._value = value;
    this._type = type;
    this._expectedValue = expectedValue;
    this._expectedType = expectedType;
    this._index = index;
  }

  static missingProperty({
    objName,
    property,
    expectedType,
    expectedValue,
  }: {
    objName: string;
    property: string;
    expectedType: ExpectedType;
    expectedValue?: string | string[] | undefined;
  }): InvalidPropertyError {
    return new InvalidPropertyError({
      objName,
      property,
      expectedType,
      expectedValue,
      type: 'undefined',
    });
  }

  static invalidFormat({
    objName,
    property,
  }: {
    objName: string;
    property: string;
  }): InvalidPropertyError {
    return new InvalidPropertyError({
      objName,
      property,
      expectedType: 'unknown',
    });
  }
}
