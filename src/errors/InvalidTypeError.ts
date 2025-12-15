import { RelayerErrorBase } from './RelayerErrorBase';

export type InvalidTypeErrorType = InvalidTypeError & {
  name: 'InvalidTypeError';
};

export class InvalidTypeError extends RelayerErrorBase {
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
      | 'Uint32'
      | 'Uint256'
      | 'ChecksummedAddress'
      | 'ChecksummedAddressArray'
      | 'Bytes32Hex'
      | 'Bytes65Hex'
      | 'BytesHexNo0x'
      | 'Uint8Array'
      | 'BytesHexArray'
      | 'Bytes32HexArray'
      | 'Bytes65HexArray'
      | 'Array'
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
