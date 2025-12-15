import { RelayerErrorBase } from './RelayerErrorBase';

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
  | 'Bytes65Hex'
  | 'BytesHexNo0x'
  | 'Uint8Array'
  | 'BytesHex'
  | 'Timestamp'
  | 'unknown';

export class InvalidPropertyError extends RelayerErrorBase {
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
    let missing = type === 'undefined' && expectedValue !== undefined;

    let varname;
    if (!property || property === '') {
      varname = index !== undefined ? `${objName}[${index}]` : `${objName}`;
    } else {
      varname =
        index !== undefined
          ? `${objName}.${property}[${index}]`
          : `${objName}.${property}`;
    }

    let message = missing
      ? `InvalidPropertyError: Missing '${varname}'`
      : `InvalidPropertyError: ${varname}`;

    if (type === expectedType) {
      if (value !== undefined) {
        message += ` unexpected value ${value}`;
      }
    } else {
      if (missing) {
        if (Array.isArray(expectedValue)) {
          expectedValue = expectedValue.join('|');
        }
        message += `, expected '${varname}: ${expectedValue}'.`;
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

  static invalidObject({
    objName,
    expectedType,
    type,
  }: {
    objName: string;
    expectedType: ExpectedType;
    type?: string;
  }): InvalidPropertyError {
    return new InvalidPropertyError({
      objName,
      property: '',
      expectedType,
      type,
    });
  }
}
