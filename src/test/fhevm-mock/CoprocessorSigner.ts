import type { ethers as EthersT } from 'ethers';
import type { CoprocessorEIP712Type } from '../../sdk/coprocessor/types';
import type { ChecksummedAddress } from '../../base/types/primitives';
import { EIP712Signer } from './EIP712Signer';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorSigner
////////////////////////////////////////////////////////////////////////////////

export class CoprocessorSigner extends EIP712Signer<CoprocessorEIP712Type> {
  constructor(signer: EthersT.Signer, address: ChecksummedAddress) {
    super(signer, address);
  }
}
