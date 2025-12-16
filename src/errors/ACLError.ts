import { Prettify } from '../utils/types';
import { Bytes32Hex, ChecksummedAddress } from '../types/primitives';
import { RelayerErrorBase, RelayerErrorBaseParams } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// ACLErrorBase
////////////////////////////////////////////////////////////////////////////////

export type ACLErrorBaseType = ACLErrorBase & {
  name: 'ACLErrorBase';
};

export type ACLErrorBaseParams = Prettify<
  RelayerErrorBaseParams & {
    aclAddress: ChecksummedAddress;
    handle: Bytes32Hex;
  }
>;

export abstract class ACLErrorBase extends RelayerErrorBase {
  private readonly _aclAddress: ChecksummedAddress;
  private readonly _handle: Bytes32Hex;

  constructor(params: ACLErrorBaseParams) {
    super({
      ...params,
      name: params.name ?? 'ACLErrorBase',
    });
    this._aclAddress = params.aclAddress;
    this._handle = params.handle;
  }

  public get aclAddress() {
    return this._aclAddress;
  }
  public get handle() {
    return this._handle;
  }
}

////////////////////////////////////////////////////////////////////////////////
// ACLPublicDecryptionError
////////////////////////////////////////////////////////////////////////////////

export type ACLPublicDecryptionErrorType = ACLPublicDecryptionError & {
  name: 'ACLPublicDecryptionError';
};

export class ACLPublicDecryptionError extends ACLErrorBase {
  constructor({
    aclAddress,
    handle,
  }: {
    aclAddress: ChecksummedAddress;
    handle: Bytes32Hex;
  }) {
    super({
      message: `Handle ${handle} is not allowed for public decryption!`,
      name: 'ACLPublicDecryptionError',
      aclAddress,
      handle,
    });
  }
}
