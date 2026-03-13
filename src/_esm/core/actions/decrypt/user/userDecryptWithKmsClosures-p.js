import { fetchKmsSignedcryptedShares } from "./fetchKmsSignedcryptedShares.js";
////////////////////////////////////////////////////////////////////////////////
// userDecrypt
////////////////////////////////////////////////////////////////////////////////
export async function userDecryptWithKmsClosures(fhevm, parameters) {
    const { getTkmsPublicKeyHex, decryptAndReconstruct, ...rest } = parameters;
    const tkmsPublicKeyHex = await getTkmsPublicKeyHex();
    if (tkmsPublicKeyHex !== parameters.userDecryptEIP712Message.publicKey) {
        throw new Error("");
    }
    const kmsSigncryptedShares = await fetchKmsSignedcryptedShares(fhevm, rest);
    // Using the `KmsSigncryptedShares` decrypt and reconstruct clear values
    const orderedDecryptedHandles = await decryptAndReconstruct({
        shares: kmsSigncryptedShares,
    });
    return orderedDecryptedHandles;
}
//# sourceMappingURL=userDecryptWithKmsClosures-p.js.map