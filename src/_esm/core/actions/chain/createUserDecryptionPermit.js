import { createFhevmUserDecryptionPermit } from "../../kms/FhevmUserDecryptionPermit-p.js";
import { verifyKmsUserDecryptEIP712 } from "./verifyKmsUserDecryptEIP712.js";
export async function createUserDecryptionPermit(fhevm, parameters) {
    const { signerAddress, signature, eip712 } = parameters;
    await verifyKmsUserDecryptEIP712(fhevm, {
        signer: signerAddress,
        message: eip712.message,
        signature,
    });
    return createFhevmUserDecryptionPermit(parameters);
}
//# sourceMappingURL=createUserDecryptionPermit.js.map