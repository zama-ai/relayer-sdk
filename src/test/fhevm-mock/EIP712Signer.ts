import type { ethers as EthersT } from 'ethers';
import { ethers } from 'ethers';
import { signEIP712 } from '../eip712';
import { BytesHex, ChecksummedAddress } from '../../types/primitives';

////////////////////////////////////////////////////////////////////////////////
// EIP712SignableType
////////////////////////////////////////////////////////////////////////////////

export type EIP712SignableType = {
  domain: EthersT.TypedDataDomain;
  types: Record<
    string,
    readonly { readonly name: string; readonly type: string }[]
  >;
  message: Record<string, unknown>;
  primaryType?: string;
};

////////////////////////////////////////////////////////////////////////////////
// EIP712Signer Base Class
////////////////////////////////////////////////////////////////////////////////

export abstract class EIP712Signer<
  T extends EIP712SignableType = EIP712SignableType,
> {
  protected readonly _signer: EthersT.Signer;
  protected readonly _address: ChecksummedAddress;

  private static readonly DEFAULT_MNEMONIC =
    'test test test test test test test future home encrypt virtual machine';

  protected constructor(signer: EthersT.Signer, address: ChecksummedAddress) {
    this._signer = signer;
    this._address = address;
  }

  public get signer(): EthersT.Signer {
    return this._signer;
  }

  public get address(): ChecksummedAddress {
    return this._address;
  }

  static async fromSigner<S extends EIP712Signer>(
    this: new (signer: EthersT.Signer, address: ChecksummedAddress) => S,
    signer: EthersT.Signer,
  ): Promise<S> {
    const address = (await signer.getAddress()) as ChecksummedAddress;
    return new this(signer, address);
  }

  static fromPrivateKey<S extends EIP712Signer>(
    this: new (signer: EthersT.Signer, address: ChecksummedAddress) => S,
    privateKey: BytesHex,
  ): S {
    const wallet = new ethers.Wallet(privateKey);
    return new this(
      wallet,
      ethers.getAddress(wallet.address.toLowerCase()) as ChecksummedAddress,
    );
  }

  static fromMnemonic<S extends EIP712Signer>(
    this: new (signer: EthersT.Signer, address: ChecksummedAddress) => S,
    {
      mnemonic,
      path,
      index,
      basePath,
      wordlist,
    }: {
      mnemonic: string;
      path?: string;
      basePath?: string;
      index?: number;
      wordlist?: ethers.Wordlist;
    },
  ): S {
    if (index === undefined) {
      index = 0;
    }
    basePath = basePath || "m/44'/60'/0'/0/";
    const hdNode = ethers.HDNodeWallet.fromPhrase(
      mnemonic,
      undefined, // password
      path || basePath + index,
      wordlist,
    );
    return new this(
      hdNode,
      ethers.getAddress(hdNode.address.toLowerCase()) as ChecksummedAddress,
    );
  }

  static createDefault<S extends EIP712Signer>(
    this: new (signer: EthersT.Signer, address: ChecksummedAddress) => S,
    {
      index,
      basePath,
    }: {
      index?: number;
      basePath?: string;
    },
  ): S {
    if (index === undefined) {
      index = 0;
    }
    basePath = basePath || "m/44'/60'/0'/0/";
    const hdNode = ethers.HDNodeWallet.fromPhrase(
      EIP712Signer.DEFAULT_MNEMONIC,
      undefined,
      basePath + index,
    );
    return new this(
      hdNode,
      ethers.getAddress(hdNode.address.toLowerCase()) as ChecksummedAddress,
    );
  }

  public async sign(eip712: T): Promise<BytesHex> {
    return signEIP712(
      this._signer,
      eip712.domain,
      eip712.types as Record<string, Array<EthersT.TypedDataField>>,
      eip712.message,
      eip712.primaryType,
    );
  }
}
