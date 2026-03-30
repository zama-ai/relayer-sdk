import { concatBytesHex } from "../../base/bytes.js";
import {
  abiEncodeClearValues,
  createClearValueArray,
} from "../../handle/ClearValue.js";
import { toClearValueType } from "../../handle/FheType.js";
import { PublicDecryptionProofImpl } from "../../kms/PublicDecryptionProof-p.js";
import type {
  ClearValueType,
  SolidityPrimitiveTypeName,
} from "../../types/fheType.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { Bytes65Hex, BytesHex } from "../../types/primitives.js";
import type { PublicDecryptionProof } from "../../types/publicDecryptionProof.js";
import { verifyKmsPublicDecryptEIP712 } from "./verifyKmsPublicDecryptEIP712.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { EncryptedValue } from "../../types/encryptedTypes.js";

//////////////////////////////////////////////////////////////////////////////

export type CreatePublicDecryptionProofParameters = {
  readonly orderedEncryptedValues: readonly EncryptedValue[];
  readonly orderedAbiEncodedClearValues: BytesHex;
  readonly kmsPublicDecryptEIP712Signatures: readonly Bytes65Hex[];
  readonly extraData: BytesHex;
};

export type CreatePublicDecryptionProofReturnType = PublicDecryptionProof;

//////////////////////////////////////////////////////////////////////////////

export async function createPublicDecryptionProof(
  fhevm: Fhevm<FhevmChain>,
  parameters: CreatePublicDecryptionProofParameters,
): Promise<CreatePublicDecryptionProofReturnType> {
  await verifyKmsPublicDecryptEIP712(fhevm, parameters);

  const {
    orderedEncryptedValues,
    orderedAbiEncodedClearValues,
    kmsPublicDecryptEIP712Signatures,
    extraData,
  } = parameters;

  //////////////////////////////////////////////////////////////////////////////
  // Compute the proof as numSigners + KMS signatures + extraData
  //////////////////////////////////////////////////////////////////////////////

  const packedNumSigners: BytesHex = fhevm.runtime.ethereum.encodePacked({
    types: ["uint8"],
    values: [kmsPublicDecryptEIP712Signatures.length],
  });

  const packedSignatures = fhevm.runtime.ethereum.encodePacked({
    types: Array(kmsPublicDecryptEIP712Signatures.length).fill(
      "bytes",
    ) as string[],
    values: kmsPublicDecryptEIP712Signatures,
  });

  const decryptionProof: BytesHex = concatBytesHex([
    packedNumSigners,
    packedSignatures,
    extraData,
  ]);

  //////////////////////////////////////////////////////////////////////////////
  // Deserialize ordered decrypted result
  //////////////////////////////////////////////////////////////////////////////

  const orderedAbiTypes: SolidityPrimitiveTypeName[] =
    orderedEncryptedValues.map((h) => h.solidityPrimitiveTypeName);

  const decoded = fhevm.runtime.ethereum.decode({
    types: orderedAbiTypes,
    encodedData: orderedAbiEncodedClearValues,
  });

  if (decoded.length !== orderedEncryptedValues.length) {
    throw new Error("Invalid decrypted result.");
  }

  const orderedValues: ClearValueType[] = orderedEncryptedValues.map(
    (h, index) => toClearValueType(h.fheType, decoded[index]),
  );

  const originToken: symbol = Symbol("asasa");
  const orderedDecryptedFhevmHandles = createClearValueArray({
    orderedEncryptedValues,
    orderedValues,
    originToken,
  });

  const orderedAbiEncodedDecryptedFhevmHandles = abiEncodeClearValues(fhevm, {
    orderedClearValues: orderedDecryptedFhevmHandles,
  });

  return new PublicDecryptionProofImpl({
    decryptionProof: decryptionProof,
    orderedClearValues: orderedDecryptedFhevmHandles,
    orderedAbiEncodedClearValues:
      orderedAbiEncodedDecryptedFhevmHandles.abiEncodedClearValues,
    extraData,
  });
}
