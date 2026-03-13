import { assertKmsSignerThreshold } from "../../../host-contracts/KmsSignersContext-p.js";
import { createKmsEIP712Domain } from "../../../kms/createKmsEIP712Domain.js";
import { kmsPublicDecryptEIP712Types } from "../../../kms/kmsPublicDecryptEIP712Types.js";
import { recoverSigners } from "../../runtime/recoverSigners.js";
import { readKmsSignersContext } from "../readKmsSignersContext.js";
export async function verifyKmsPublicDecryptEIP712(fhevm, parameters) {
    const handlesBytes32Hex = parameters.orderedHandles.map((h) => h.bytes32Hex);
    const message = {
        ctHandles: handlesBytes32Hex,
        decryptedResult: parameters.orderedAbiEncodedClearValues,
        extraData: parameters.extraData,
    };
    const domain = createKmsEIP712Domain({
        chainId: fhevm.chain.fhevm.gateway.id,
        verifyingContractAddressDecryption: fhevm.chain.fhevm.gateway.contracts.decryption.address,
    });
    // 1. Verify signatures
    const recoveredAddresses = await recoverSigners(fhevm, {
        domain,
        types: kmsPublicDecryptEIP712Types,
        primaryType: "PublicDecryptVerification",
        signatures: parameters.kmsPublicDecryptEIP712Signatures,
        message,
    });
    const kmsSignersContext = await readKmsSignersContext(fhevm);
    // 2. Verify signature theshold is reached
    assertKmsSignerThreshold(kmsSignersContext, recoveredAddresses);
}
//# sourceMappingURL=verifyKmsPublicDecryptEIP712.js.map