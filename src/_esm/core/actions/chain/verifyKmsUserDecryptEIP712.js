import { ThresholdSignerError, UnknownSignerError, } from "../../errors/SignersError.js";
import { createKmsEIP712Domain } from "../../kms/createKmsEIP712Domain.js";
import { kmsUserDecryptEIP712Types } from "../../kms/kmsUserDecryptEIP712Types.js";
import { recoverSigners } from "../runtime/recoverSigners.js";
export async function verifyKmsUserDecryptEIP712(fhevm, parameters) {
    const domain = createKmsEIP712Domain({
        chainId: fhevm.chain.id,
        verifyingContractAddressDecryption: fhevm.chain.fhevm.gateway.contracts.decryption.address,
    });
    const recoveredAddresses = await recoverSigners(fhevm, {
        domain,
        types: kmsUserDecryptEIP712Types,
        primaryType: "UserDecryptRequestVerification",
        signatures: [parameters.signature],
        message: parameters.message,
    });
    if (recoveredAddresses.length !== 1) {
        throw new ThresholdSignerError({
            type: "kms",
        });
    }
    if (recoveredAddresses[0] !== parameters.signer) {
        throw new UnknownSignerError({
            unknownAddress: recoveredAddresses[0],
            type: "kms",
        });
    }
}
//# sourceMappingURL=verifyKmsUserDecryptEIP712.js.map