import { verifyKmsUserDecryptEIP712 } from "./verifyKmsUserDecryptEIP712.js";
import { isVerifiedUserDecryptionPermit } from "../../kms/FhevmUserDecryptionPermit-p.js";
export async function verifyUserDecryptionPermit(fhevm, parameters) {
    const { permit } = parameters;
    if (isVerifiedUserDecryptionPermit(permit)) {
        return;
    }
    await verifyKmsUserDecryptEIP712(fhevm, {
        signer: permit.signerAddress,
        message: permit.eip712.message,
        signature: permit.signature,
    });
}
//# sourceMappingURL=verifyUserDecryptionPermit.js.map