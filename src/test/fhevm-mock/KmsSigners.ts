import type { Prettify } from '../../utils/types';
import type { BytesHex } from '../../types/primitives';

import { Wordlist } from 'ethers';
import { KmsSigner } from './KmsSigner';
import { EIP712Signers } from './EIP712Signers';
import {
  KmsEIP712,
  type KmsEIP712Params,
  type KmsDelegateEIP712Type,
  type KmsEIP712Type,
} from '../../sdk/kms/KmsEIP712';

////////////////////////////////////////////////////////////////////////////////
// KmsSigners (Multi-sig for KMS)
////////////////////////////////////////////////////////////////////////////////

type KmsSignersBaseParams = KmsEIP712Params;

type KmsSignersParams = Prettify<
  { signers: KmsSigner[] } & KmsSignersBaseParams
>;

export class KmsSigners extends EIP712Signers<
  KmsSigner,
  KmsEIP712Type | KmsDelegateEIP712Type
> {
  private static readonly DEFAULT_KMS_SIGNER_BASE_PATH = "m/44'/60'/2'/0";

  private readonly _kmsEIP712: KmsEIP712;

  private constructor(params: KmsSignersParams) {
    super(params.signers);
    this._kmsEIP712 = new KmsEIP712({
      ...params,
    });
  }

  public get ____kmsEIP712ToBeRemoved(): KmsEIP712 {
    return this._kmsEIP712;
  }

  /**
   * Create from an array of KmsSigner instances
   */
  static from(params: KmsSignersParams): KmsSigners {
    return new KmsSigners(params);
  }

  /**
   * Create from an array of private keys
   */
  static fromPrivateKeys(
    params: Prettify<{ privateKeys: BytesHex[] } & KmsSignersBaseParams>,
  ): KmsSigners {
    const signers: KmsSigner[] = [];
    for (const privateKey of params.privateKeys) {
      signers.push(KmsSigner.fromPrivateKey(privateKey));
    }
    return new KmsSigners({ ...params, signers });
  }

  /**
   * Create from a mnemonic with multiple indices
   */
  static fromMnemonic(
    params: Prettify<
      {
        mnemonic: string;
        startIndex?: number;
        count: number;
        basePath?: string;
        wordlist?: Wordlist;
      } & KmsSignersBaseParams
    >,
  ): KmsSigners {
    const signers: KmsSigner[] = [];
    const basePath = params.basePath || "m/44'/60'/0'/0/";
    const startIndex = params.startIndex ?? 0;
    for (let i = 0; i < params.count; i++) {
      signers.push(
        KmsSigner.fromMnemonic({
          mnemonic: params.mnemonic,
          path: `${basePath}${i + startIndex}`,
          wordlist: params.wordlist,
        }),
      );
    }
    return new KmsSigners({ ...params, signers });
  }

  /**
   * Create a default set of signers for testing (using default mnemonic)
   */
  static createDefault(
    params: Prettify<{ count?: number } & KmsSignersBaseParams>,
  ): KmsSigners {
    const signers: KmsSigner[] = [];
    const count = params.count ?? 1;
    for (let i = 0; i < count; ++i) {
      const cp = KmsSigner.createDefault({
        index: i,
        basePath: KmsSigners.DEFAULT_KMS_SIGNER_BASE_PATH,
      });
      signers.push(cp);
    }
    return new KmsSigners({ ...params, signers });
  }
}
