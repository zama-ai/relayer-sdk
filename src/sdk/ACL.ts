import { Contract } from 'ethers';
import type { ethers as EthersT } from 'ethers';
import { Bytes32Hex, ChecksummedAddress } from '../types/primitives';
import { isChecksummedAddress } from '../utils/address';
import { ChecksummedAddressError } from '../errors/ChecksummedAddressError';
import { assertIsBytes32HexArray } from '../utils/bytes';
import { ACLPublicDecryptionError } from '../errors/ACLError';

////////////////////////////////////////////////////////////////////////////////
// ACL
////////////////////////////////////////////////////////////////////////////////

export class ACL {
  private readonly _aclAddress: ChecksummedAddress;

  private static readonly aclABI = [
    'function persistAllowed(bytes32 handle, address account) view returns (bool)',
    'function isAllowedForDecryption(bytes32 handle) view returns (bool)',
  ] as const;

  constructor(aclAddress: ChecksummedAddress) {
    if (!isChecksummedAddress(aclAddress)) {
      throw new ChecksummedAddressError({ address: aclAddress });
    }
    this._aclAddress = aclAddress;
  }

  public async isAllowedForDecryption(
    handles: Bytes32Hex[],
    provider: EthersT.ContractRunner,
  ) {
    assertIsBytes32HexArray(handles);

    const acl = new Contract(this._aclAddress, ACL.aclABI, provider);

    await Promise.all(
      handles.map(async (h) => {
        const isAllowedForDecryption = await acl.isAllowedForDecryption(h);
        if (!isAllowedForDecryption) {
          throw new ACLPublicDecryptionError({
            aclAddress: this._aclAddress,
            handle: h,
          });
        }
      }),
    );
  }
}
