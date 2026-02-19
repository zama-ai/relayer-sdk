import type { Bytes32Hex, Bytes65Hex, BytesHex } from '@base/types/primitives';
import type {
  FhevmConfig,
  FhevmHandle,
  PublicDecryptionProof,
} from '@fhevm-base/types/public-api';
import type { FetchPublicDecryptPayload } from './types/private-api';
import type { RelayerPublicDecryptOptions } from './types/public-api';
import type { FetchPublicDecryptResult } from './types/public-api';
import type { FhevmChainClient } from '@fhevm-base-types/public-api';
import { createACL } from '@fhevm-base/host-contracts/ACL';
import { ensure0x } from '@base/string';
import { fetchPublicDecrypt } from './fetch/publicDecrypt';
import { createPublicDecryptionProof } from '@fhevm-base/kms/PublicDecryptionProof';
import { assertKmsDecryptionBitLimit } from '@fhevm-base/kms/utils';

////////////////////////////////////////////////////////////////////////////////
// publicDecrypt
////////////////////////////////////////////////////////////////////////////////

export async function publicDecrypt(
  fhevm: FhevmChainClient & { config: FhevmConfig; relayerUrl: string },
  args: {
    readonly handles: readonly FhevmHandle[];
    readonly extraData: BytesHex;
    readonly options?: RelayerPublicDecryptOptions;
  },
): Promise<PublicDecryptionProof> {
  // Check 2048 bits limit
  assertKmsDecryptionBitLimit(args.handles);

  // Check ACL permissions
  const acl = createACL(fhevm);
  await acl.checkAllowedForDecryption(args.handles);

  const orderedHandlesBytes32Hex: Bytes32Hex[] = args.handles.map(
    (h) => h.bytes32Hex,
  );

  // Call relayer
  const payloadForRequest: FetchPublicDecryptPayload = {
    ciphertextHandles: orderedHandlesBytes32Hex,
    extraData: args.extraData,
  };

  const json: FetchPublicDecryptResult = await fetchPublicDecrypt(
    fhevm.relayerUrl,
    payloadForRequest,
    args.options,
  );

  // Sanitize relayer response
  const decryptedResult: BytesHex = ensure0x(json.decryptedValue) as BytesHex;
  const kmsSignatures: readonly Bytes65Hex[] = json.signatures.map(
    ensure0x,
  ) as Bytes65Hex[];

  ////////////////////////////////////////////////////////////////////////////
  //
  // Warning!!!! Do not use '0x00' here!! Only '0x' is permitted!
  //
  ////////////////////////////////////////////////////////////////////////////
  const signedExtraData = '0x' as BytesHex;

  ////////////////////////////////////////////////////////////////////////////
  // Compute the PublicDecryptionProof
  ////////////////////////////////////////////////////////////////////////////

  const publicDecryptionProof: PublicDecryptionProof =
    await createPublicDecryptionProof(fhevm, {
      orderedHandles: args.handles,
      orderedDecryptedResult: decryptedResult,
      signatures: kmsSignatures,
      extraData: signedExtraData,
    });

  return publicDecryptionProof;
}
