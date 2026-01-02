import type { ethers as EthersT } from 'ethers';
import type { KmsDelegateEIP712Type, KmsEIP712Type } from '../../sdk/kms/types';
import type { ChecksummedAddress } from '../../base/types/primitives';
import { EIP712Signer } from './EIP712Signer';

////////////////////////////////////////////////////////////////////////////////
// KmsSigner
////////////////////////////////////////////////////////////////////////////////

export class KmsSigner extends EIP712Signer<
  KmsEIP712Type | KmsDelegateEIP712Type
> {
  constructor(signer: EthersT.Signer, address: ChecksummedAddress) {
    super(signer, address);
  }
}
