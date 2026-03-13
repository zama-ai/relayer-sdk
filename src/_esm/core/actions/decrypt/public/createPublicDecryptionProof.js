import { concatBytesHex } from "../../../base/bytes.js";
import { abiEncodeDecryptedFhevmHandles, createDecryptedFhevmHandleArray, } from "../../../handle/DecryptedFhevmHandle.js";
import { toDecryptedFheValue } from "../../../handle/FheType.js";
import { PublicDecryptionProofImpl } from "../../../kms/PublicDecryptionProof-p.js";
import { verifyKmsPublicDecryptEIP712 } from "./verifyKmsPublicDecryptEIP712.js";
//////////////////////////////////////////////////////////////////////////////
export async function createPublicDecryptionProof(fhevm, parameters) {
    await verifyKmsPublicDecryptEIP712(fhevm, parameters);
    const { orderedHandles, orderedAbiEncodedClearValues, kmsPublicDecryptEIP712Signatures, extraData, } = parameters;
    //////////////////////////////////////////////////////////////////////////////
    // Compute the proof as numSigners + KMS signatures + extraData
    //////////////////////////////////////////////////////////////////////////////
    const packedNumSigners = fhevm.runtime.ethereum.encodePacked({
        types: ["uint8"],
        values: [kmsPublicDecryptEIP712Signatures.length],
    });
    const packedSignatures = fhevm.runtime.ethereum.encodePacked({
        types: Array(kmsPublicDecryptEIP712Signatures.length).fill("bytes"),
        values: kmsPublicDecryptEIP712Signatures,
    });
    const decryptionProof = concatBytesHex([
        packedNumSigners,
        packedSignatures,
        extraData,
    ]);
    //////////////////////////////////////////////////////////////////////////////
    // Deserialize ordered decrypted result
    //////////////////////////////////////////////////////////////////////////////
    const orderedAbiTypes = orderedHandles.map((h) => h.solidityPrimitiveTypeName);
    const decoded = fhevm.runtime.ethereum.decode({
        types: orderedAbiTypes,
        encodedData: orderedAbiEncodedClearValues,
    });
    if (decoded.length !== orderedHandles.length) {
        throw new Error("Invalid decrypted result.");
    }
    const orderedClearValues = orderedHandles.map((h, index) => toDecryptedFheValue(h.fheType, decoded[index]));
    const originToken = Symbol("asasa");
    const orderedDecryptedFhevmHandles = createDecryptedFhevmHandleArray(orderedHandles, orderedClearValues, originToken);
    const orderedAbiEncodedDecryptedFhevmHandles = abiEncodeDecryptedFhevmHandles(fhevm, {
        orderedHandles: orderedDecryptedFhevmHandles,
    });
    return new PublicDecryptionProofImpl({
        decryptionProof: decryptionProof,
        orderedDecryptedHandles: orderedDecryptedFhevmHandles,
        orderedAbiEncodedClearValues: orderedAbiEncodedDecryptedFhevmHandles.abiEncodedClearValues,
        extraData,
    });
}
//# sourceMappingURL=createPublicDecryptionProof.js.map