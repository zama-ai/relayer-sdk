import type { ethers as EthersT } from 'ethers';
import { EIP712Signer } from './EIP712Signer';
import { type CoprocessorEIP712Type } from '../../sdk/coprocessor/CoprocessorEIP712';
import { ChecksummedAddress } from '../../types/primitives';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorSigner
////////////////////////////////////////////////////////////////////////////////

export class CoprocessorSigner extends EIP712Signer<CoprocessorEIP712Type> {
  constructor(signer: EthersT.Signer, address: ChecksummedAddress) {
    super(signer, address);
  }
}
