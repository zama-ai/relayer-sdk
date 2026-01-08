import { RelayerErrorBase } from './RelayerErrorBase';

export type InvalidTypeErrorType = InvalidTypeError & {
  name: 'InvalidTypeError';
};

export class InvalidTypeError extends RelayerErrorBase {
  private readonly _varName?: string | undefined;
  private readonly _type?: string | undefined;
  private readonly _expectedType: string;
  private readonly _expectedCustomType?: string | undefined;
  constructor({
    varName,
    type,
    expectedType,
    expectedCustomType,
  }: {
    varName?: string | undefined;
    type?: string | undefined;
    expectedType:
      | 'string'
      | 'boolean'
      | 'Uint'
      | 'UintNumber'
      | 'Uint8'
      | 'Uint16'
      | 'Uint32'
      | 'Uint64'
      | 'Uint128'
      | 'Uint256'
      | 'Address'
      | 'AddressArray'
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
      | 'EncryptionBits'
      | 'EncryptionBitsArray'
      | 'Custom';
    expectedCustomType?: string | undefined;
  }) {
    super({
      message: `InvalidTypeError ${varName} ${expectedType} ${type}`,
      name: 'InvalidTypeError',
    });
    this._varName = varName;
    this._type = type;
    this._expectedType = expectedType;
    this._expectedCustomType = expectedCustomType;
  }

  public get varName() {
    return this._varName;
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
