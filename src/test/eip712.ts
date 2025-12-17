import type { ethers as EthersT } from 'ethers';
import { Signature } from 'ethers';
import { assertIs0xString, remove0x } from '../utils/string';
import { BytesHex } from '../types/primitives';

export async function signEIP712(
  signer: EthersT.Signer,
  domain: EthersT.TypedDataDomain,
  types: Record<string, Array<EthersT.TypedDataField>>,
  message: Record<string, unknown>,
  primaryType?: string,
): Promise<BytesHex> {
  // If primaryType is specified, filter types to only include the primary type
  // This ensures ethers uses the correct primary type for signing
  const typesToSign = primaryType
    ? { [primaryType]: types[primaryType]! }
    : types;

  const signature = await signer.signTypedData(domain, typesToSign, message);
  const sigRSV = Signature.from(signature);
  const v = 27 + sigRSV.yParity;
  const r = sigRSV.r;
  const s = sigRSV.s;

  const result = r + remove0x(s) + v.toString(16);

  assertIs0xString(result);

  return result;
}

export async function multiSignEIP712(
  signers: EthersT.Signer[],
  domain: EthersT.TypedDataDomain,
  types: Record<string, Array<EthersT.TypedDataField>>,
  message: Record<string, unknown>,
  primaryType?: string,
): Promise<BytesHex[]> {
  const signatures: `0x${string}`[] = [];
  for (let idx = 0; idx < signers.length; idx++) {
    const signer = signers[idx];
    const signature = await signEIP712(
      signer!,
      domain,
      types,
      message,
      primaryType,
    );
    signatures.push(signature);
  }
  return signatures;
}
