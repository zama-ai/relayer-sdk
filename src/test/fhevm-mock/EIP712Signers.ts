import { Bytes65Hex, ChecksummedAddress } from '../../types/primitives';
import { EIP712Signer, type EIP712SignableType } from './EIP712Signer';

////////////////////////////////////////////////////////////////////////////////
// EIP712Signers Base Class (Multi-sig)
////////////////////////////////////////////////////////////////////////////////

export class EIP712Signers<
  TSigner extends EIP712Signer<TEIP712>,
  TEIP712 extends EIP712SignableType = EIP712SignableType,
> {
  protected readonly _signers: TSigner[];

  protected constructor(signers: TSigner[]) {
    if (signers.length === 0) {
      throw new Error('EIP712Signers requires at least one signer');
    }
    this._signers = [...signers];
    Object.freeze(this._signers);
  }

  public get signers(): readonly TSigner[] {
    return this._signers;
  }

  public get addresses(): ChecksummedAddress[] {
    return this._signers.map((s) => s.address);
  }

  public get count(): number {
    return this._signers.length;
  }

  /**
   * Sign with all signers
   */
  public async sign(eip712: TEIP712): Promise<Bytes65Hex[]> {
    return this.signWithCount(eip712, this._signers.length);
  }

  /**
   * Sign with a specific number of signers (for threshold testing)
   * @param eip712 The EIP-712 typed data to sign
   * @param count Number of signers to use (must be <= total signers)
   * @returns Array of signatures
   */
  public async signWithCount(
    eip712: TEIP712,
    count?: number,
  ): Promise<Bytes65Hex[]> {
    if (count === undefined) {
      count = this._signers.length;
    }
    if (count < 0 || count > this._signers.length) {
      throw new Error(
        `Invalid signer count: ${count}. Must be between 0 and ${this._signers.length}`,
      );
    }

    const signatures: Bytes65Hex[] = [];
    for (let i = 0; i < count; i++) {
      const signature = await this._signers[i]!.sign(eip712);
      signatures.push(signature);
    }
    return signatures;
  }
}
