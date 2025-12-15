import type { ethers as EthersT } from 'ethers';
import { assertIsBytes65Hex } from './bytes';
import { verifyTypedData as ethersVerifyTypesData } from 'ethers';
import { assertIsChecksummedAddress } from './address';
import { Bytes65Hex, ChecksummedAddress } from '../types/primitives';

export function verifySignature({
  signature,
  domain,
  types,
  message,
  primaryType,
}: {
  signature: Bytes65Hex;
  domain: EthersT.TypedDataDomain;
  types: Record<string, Array<EthersT.TypedDataField>>;
  message: Record<string, unknown>;
  primaryType?: string;
}): ChecksummedAddress {
  assertIsBytes65Hex(signature);

  // If primaryType is specified, filter types to only include the primary type
  // This ensures ethers uses the correct primary type for signing
  const typesToSign = primaryType
    ? { [primaryType]: types[primaryType]! }
    : types;

  const recoveredAddress = ethersVerifyTypesData(
    domain,
    typesToSign,
    message,
    signature,
  );

  assertIsChecksummedAddress(recoveredAddress);

  return recoveredAddress;
}
