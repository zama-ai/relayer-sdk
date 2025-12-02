import { RelayerBaseError } from './RelayerBaseError';

export type InvalidTypeErrorType = InvalidTypeError & {
  name: 'InvalidTypeError';
};

export class InvalidTypeError extends RelayerBaseError {
  readonly _objName?: string;
  readonly _type?: string | undefined;
  readonly _expectedType: string;
  constructor({
    objName,
    type,
    expectedType,
  }: {
    objName?: string;
    type?: string;
    expectedType:
      | 'string'
      | 'Uint'
      | 'ChecksummedAddress'
      | 'Bytes32Hex'
      | 'BytesHexNo0x'
      | 'Uint8Array'
      | 'BytesHex';
  }) {
    super({
      message: `InvalidTypeError ${objName} ${expectedType} ${type}`,
      name: 'InvalidTypeError',
    });
    this._objName = objName;
    this._type = type;
    this._expectedType = expectedType;
  }
}
