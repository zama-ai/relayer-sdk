import { ethers } from 'ethers';
import { CoprocessorSigner } from './CoprocessorSigner';
import { EIP712Signers } from './EIP712Signers';
import type {
  CoprocessorEIP712MessageType,
  CoprocessorEIP712Params,
  CoprocessorEIP712Type,
} from '../../sdk/coprocessor/CoprocessorEIP712';
import { CoprocessorEIP712 } from '../../sdk/coprocessor/CoprocessorEIP712';
import type { Prettify } from '../../utils/types';
import { remove0x } from '../../utils/string';
import {
  Bytes32Hex,
  Bytes32HexNo0x,
  Bytes65Hex,
  Bytes65HexNo0x,
  BytesHex,
} from '../../types/primitives';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorSigners (Multi-sig for Coprocessor)
////////////////////////////////////////////////////////////////////////////////

type CoprocessorSignersBaseParams = CoprocessorEIP712Params;

type CoprocessorSignersParams = Prettify<
  { signers: CoprocessorSigner[] } & CoprocessorSignersBaseParams
>;

export class CoprocessorSigners extends EIP712Signers<
  CoprocessorSigner,
  CoprocessorEIP712Type
> {
  private static readonly DEFAULT_COPROCESSOR_SIGNER_BASE_PATH =
    "m/44'/60'/1'/0";

  private readonly _coprocessorEIP712: CoprocessorEIP712;

  private constructor(params: CoprocessorSignersParams) {
    super(params.signers);
    this._coprocessorEIP712 = new CoprocessorEIP712({
      ...params,
    });
  }

  /**
   * Create from an array of CoprocessorSigner instances
   */
  static from(params: CoprocessorSignersParams): CoprocessorSigners {
    return new CoprocessorSigners(params);
  }

  /**
   * Create from an array of private keys
   */
  static fromPrivateKeys(
    params: Prettify<
      { privateKeys: BytesHex[] } & CoprocessorSignersBaseParams
    >,
  ): CoprocessorSigners {
    const signers: CoprocessorSigner[] = [];
    for (const privateKey of params.privateKeys) {
      signers.push(CoprocessorSigner.fromPrivateKey(privateKey));
    }
    return new CoprocessorSigners({ ...params, signers });
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
        wordlist?: ethers.Wordlist;
      } & CoprocessorSignersBaseParams
    >,
  ): CoprocessorSigners {
    const signers: CoprocessorSigner[] = [];
    const basePath = params.basePath || "m/44'/60'/0'/0/";
    const startIndex = params.startIndex ?? 0;
    for (let i = 0; i < params.count; i++) {
      signers.push(
        CoprocessorSigner.fromMnemonic({
          mnemonic: params.mnemonic,
          path: `${basePath}${i + startIndex}`,
          wordlist: params.wordlist,
        }),
      );
    }
    return new CoprocessorSigners({ ...params, signers });
  }

  /**
   * Create a default set of signers for testing (using default mnemonic)
   */
  static createDefault(
    params: Prettify<{ count?: number } & CoprocessorSignersBaseParams>,
  ): CoprocessorSigners {
    const signers: CoprocessorSigner[] = [];
    const count = params.count ?? 1;
    for (let i = 0; i < count; ++i) {
      const cp = CoprocessorSigner.createDefault({
        index: i,
        basePath: CoprocessorSigners.DEFAULT_COPROCESSOR_SIGNER_BASE_PATH,
      });
      signers.push(cp);
    }
    return new CoprocessorSigners({ ...params, signers });
  }

  public async computeSignatures(
    params: CoprocessorEIP712MessageType,
    count?: number,
  ): Promise<{
    handles: Bytes32Hex[];
    signatures: Bytes65Hex[];
  }> {
    // 1. Create the Coprocessor EIP712
    const eip712 = this._coprocessorEIP712.createEIP712(params);

    // 2. Sign it!
    const signaturesHex: Bytes65Hex[] = await this.signWithCount(eip712, count);

    return {
      signatures: signaturesHex,
      handles: params.ctHandles,
    };
  }

  public async computeSignaturesNo0x(
    params: CoprocessorEIP712MessageType,
    count?: number,
  ): Promise<{
    handles: Bytes32HexNo0x[];
    signatures: Bytes65HexNo0x[];
  }> {
    const res = await this.computeSignatures(params, count);
    return {
      signatures: res.signatures.map((sigHex) => remove0x(sigHex)),
      handles: res.handles.map((handleHex) => remove0x(handleHex)),
    };
  }
}
