import { fetchVerifiedInputProof } from "./fetchVerifiedInputProof.js";
import { generateZkProof } from "./generateZkProof.js";
export async function encrypt(fhevm, parameters) {
    const { contractAddress, userAddress, values, globalFhePublicEncryptionParams, } = parameters;
    const zkProof = await generateZkProof(fhevm, {
        globalFhePublicEncryptionParams,
        contractAddress,
        userAddress,
        values,
    });
    const inputProof = await fetchVerifiedInputProof(fhevm, {
        zkProof,
        extraData: parameters.extraData,
        options: parameters.options,
    });
    return inputProof;
}
//# sourceMappingURL=encrypt.js.map