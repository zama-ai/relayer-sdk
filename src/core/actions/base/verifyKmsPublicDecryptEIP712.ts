import { recoverSigners } from "../../utils-p/runtime/recoverSigners.js";
import { assertKmsSignerThreshold } from "../../host-contracts/KmsSignersContext-p.js";
import { createKmsEIP712Domain } from "../../kms/createKmsEIP712Domain.js";
import { kmsPublicDecryptEIP712Types } from "../../kms/kmsPublicDecryptEIP712Types.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { KmsPublicDecryptEIP712Message } from "../../types/kms.js";
import type { KmsSignersContext } from "../../types/kmsSignersContext.js";
import type {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
} from "../../types/primitives.js";
import { readKmsSignersContext } from "./readKmsSignersContext.js";
import type { EncryptedValue } from "../../types/encryptedTypes.js";

export type VerifyKmsPublicDecryptEIP712Parameters = {
  readonly orderedEncryptedValues: readonly EncryptedValue[];
  readonly orderedAbiEncodedClearValues: BytesHex;
  readonly kmsPublicDecryptEIP712Signatures: readonly Bytes65Hex[];
  readonly extraData: BytesHex;
};

export async function verifyKmsPublicDecryptEIP712(
  fhevm: Fhevm<FhevmChain>,
  parameters: VerifyKmsPublicDecryptEIP712Parameters,
): Promise<void> {
  const handlesBytes32Hex: readonly Bytes32Hex[] =
    parameters.orderedEncryptedValues.map((h) => h.bytes32Hex);

  const message: KmsPublicDecryptEIP712Message = {
    ctHandles: handlesBytes32Hex,
    decryptedResult: parameters.orderedAbiEncodedClearValues,
    extraData: parameters.extraData,
  };

  // A 'PublicDecryptVerification' KmsEIP712Domain uses the gateway chainId!
  const domain = createKmsEIP712Domain({
    chainId: fhevm.chain.fhevm.gateway.id,
    verifyingContractAddressDecryption:
      fhevm.chain.fhevm.gateway.contracts.decryption.address,
  });

  // 1. Verify signatures
  const recoveredAddresses = await recoverSigners(fhevm, {
    domain,
    types: kmsPublicDecryptEIP712Types,
    primaryType: "PublicDecryptVerification",
    signatures: parameters.kmsPublicDecryptEIP712Signatures,
    message,
  });

  const kmsSignersContext: KmsSignersContext =
    await readKmsSignersContext(fhevm);

  // 2. Verify signature theshold is reached
  assertKmsSignerThreshold(kmsSignersContext, recoveredAddresses);
}
