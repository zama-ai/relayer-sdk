import { bytesToHexLarge } from "../../base/bytes.js";
export async function generateTkmsPrivateKey(fhevm) {
    const tkmsPrivateKey = await fhevm.runtime.tkmsKey.generateTkmsPrivateKey();
    const tkmsPrivateKeyBytes = await fhevm.runtime.tkmsKey.serializeTkmsPrivateKey({ tkmsPrivateKey });
    return bytesToHexLarge(tkmsPrivateKeyBytes, false /* no0x */);
}
////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=generateTkmsPrivateKey.js.map