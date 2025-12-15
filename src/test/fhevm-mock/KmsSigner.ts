import type { ethers as EthersT } from 'ethers';
import { EIP712Signer } from './EIP712Signer';
import {
  type KmsDelegateEIP712Type,
  type KmsEIP712Type,
} from '../../sdk/kms/KmsEIP712';
import { ChecksummedAddress } from '../../types/primitives';

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
