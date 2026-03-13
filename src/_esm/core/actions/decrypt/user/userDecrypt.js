import { userDecryptWithKmsClosures } from "./userDecryptWithKmsClosures-p.js";
////////////////////////////////////////////////////////////////////////////////
export async function userDecrypt(fhevm, parameters) {
    const { decryptionKey, ...rest } = parameters;
    return await userDecryptWithKmsClosures(fhevm, {
        ...rest,
        decryptAndReconstruct: (args) => decryptionKey.decryptAndReconstruct(args),
        getTkmsPublicKeyHex: () => decryptionKey.getTkmsPublicKeyHex(),
    });
}
//# sourceMappingURL=userDecrypt.js.map