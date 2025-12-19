import { Prettify } from '../utils/types';
import { Bytes32Hex, ChecksummedAddress } from '../types/primitives';
import {
  ContractErrorBase,
  ContractErrorBaseParams,
} from './ContractErrorBase';

////////////////////////////////////////////////////////////////////////////////
// ACLErrorBase
////////////////////////////////////////////////////////////////////////////////

export type ACLErrorBaseType = ACLErrorBase & {
  name: 'ACLErrorBase';
};

export type ACLErrorBaseParams = Prettify<
  ContractErrorBaseParams & {
    handle: Bytes32Hex;
  }
>;

export abstract class ACLErrorBase extends ContractErrorBase {
  private readonly _handle: Bytes32Hex;

  constructor(params: ACLErrorBaseParams) {
    super({
      ...params,
      name: params.name ?? 'ACLErrorBase',
    });
    this._handle = params.handle;
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

export class ACLPublicDecryptionError extends ContractErrorBase {
  private readonly _handles: Bytes32Hex[];

  constructor({
    contractAddress,
    handles,
  }: {
    contractAddress: ChecksummedAddress;
    handles: Bytes32Hex[];
  }) {
    const handleList = handles.join(', ');
    super({
      message:
        handles.length === 1
          ? `Handle ${handles[0]} is not allowed for public decryption`
          : `${handles.length} handles are not allowed for public decryption: ${handleList}`,
      name: 'ACLPublicDecryptionError',
      contractAddress,
      contractName: 'ACL',
    });
    this._handles = handles;
  }

  public get handles(): Bytes32Hex[] {
    return this._handles;
  }
}

////////////////////////////////////////////////////////////////////////////////
// ACLUserDecryptionError
////////////////////////////////////////////////////////////////////////////////

export type ACLUserDecryptionErrorType = ACLUserDecryptionError & {
  name: 'ACLUserDecryptionError';
};

export class ACLUserDecryptionError extends ContractErrorBase {
  constructor({
    contractAddress,
    message,
  }: {
    contractAddress: ChecksummedAddress;
    message: string;
  }) {
    super({
      message,
      name: 'ACLUserDecryptionError',
      contractAddress,
      contractName: 'ACL',
    });
  }
}
