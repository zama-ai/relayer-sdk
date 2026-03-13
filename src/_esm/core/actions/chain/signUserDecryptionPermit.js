import { assertIsChecksummedAddress } from "../../base/address.js";
import { createKmsUserDecryptEIP712, } from "../../kms/createKmsUserDecryptEIP712.js";
import { createFhevmUserDecryptionPermit } from "../../kms/FhevmUserDecryptionPermit-p.js";
import { verifyKmsUserDecryptEIP712 } from "./verifyKmsUserDecryptEIP712.js";
export async function signUserDecryptionPermit(signer, fhevm, parameters) {
    assertIsChecksummedAddress(parameters.signerAddress, {});
    const eip712 = createKmsUserDecryptEIP712(parameters);
    const signature = await signer.signTypedData(eip712);
    await verifyKmsUserDecryptEIP712(fhevm, {
        signer: parameters.signerAddress,
        message: eip712.message,
        signature,
    });
    return createFhevmUserDecryptionPermit({
        eip712,
        signature,
        signerAddress: parameters.signerAddress,
    });
}
//# sourceMappingURL=signUserDecryptionPermit.js.map