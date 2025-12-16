import { RelayerErrorBase } from './RelayerErrorBase';

export type InvalidTypeErrorType = InvalidTypeError & {
  name: 'InvalidTypeError';
};

export class InvalidTypeError extends RelayerErrorBase {
  private readonly _objName?: string;
  private readonly _type?: string | undefined;
  private readonly _expectedType: string;
  private readonly _expectedCustomType?: string | undefined;
  constructor({
    objName,
    type,
    expectedType,
    expectedCustomType,
  }: {
    objName?: string;
    type?: string;
    expectedType:
      | 'string'
      | 'Uint'
      | 'Uint8'
      | 'Uint32'
      | 'Uint64'
      | 'Uint256'
      | 'ChecksummedAddress'
      | 'ChecksummedAddressArray'
      | 'Bytes32Hex'
      | 'Bytes65Hex'
      | 'BytesHexNo0x'
      | 'Bytes32HexNo0x'
      | 'Bytes65HexNo0x'
      | 'Bytes32'
      | 'Bytes65'
      | 'Uint8Array'
      | 'BytesHexArray'
      | 'Bytes32HexArray'
      | 'Bytes65HexArray'
      | 'Array'
      | 'BytesHex'
      | 'Custom';
    expectedCustomType?: string;
  }) {
    super({
      message: `InvalidTypeError ${objName} ${expectedType} ${type}`,
      name: 'InvalidTypeError',
    });
    this._objName = objName;
    this._type = type;
    this._expectedType = expectedType;
    this._expectedCustomType = expectedCustomType;
  }

  public get objName() {
    return this._objName;
  }
  public get type() {
    return this._type;
  }
  public get expectedType() {
    return this._expectedType;
  }
  public get expectedCustomType() {
    return this._expectedCustomType;
  }
}
