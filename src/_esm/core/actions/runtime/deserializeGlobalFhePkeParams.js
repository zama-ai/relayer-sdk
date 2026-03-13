import { hexToBytesFaster } from "../../base/bytes.js";
import { createGlobalFhePkeParams } from "../../globalFheKey/GlobalFhePkeParams-p.js";
export async function deserializeGlobalFhePkeParams(fhevm, parameters) {
    const publicKeyNative = await fhevm.runtime.encrypt.deserializeGlobalFhePublicKey({
        globalFhePublicKeyBytes: parameters.publicKeyBytes,
    });
    const crsNative = await fhevm.runtime.encrypt.deserializeGlobalFheCrs({
        globalFheCrsBytes: parameters.crsBytes,
    });
    return createGlobalFhePkeParams(new WeakRef(fhevm.runtime), {
        publicKey: publicKeyNative,
        crs: crsNative,
    });
}
export async function deserializeGlobalFhePkeParamsFromHex(fhevm, parameters) {
    const publicKeyNative = await fhevm.runtime.encrypt.deserializeGlobalFhePublicKey({
        globalFhePublicKeyBytes: {
            id: parameters.publicKeyBytesHex.id,
            bytes: hexToBytesFaster(parameters.publicKeyBytesHex.bytesHex, {
                strict: true,
            }),
        },
    });
    const crsNative = await fhevm.runtime.encrypt.deserializeGlobalFheCrs({
        globalFheCrsBytes: {
            id: parameters.crsBytesHex.id,
            capacity: parameters.crsBytesHex.capacity,
            bytes: hexToBytesFaster(parameters.crsBytesHex.bytesHex, {
                strict: true,
            }),
        },
    });
    return createGlobalFhePkeParams(new WeakRef(fhevm.runtime), {
        publicKey: publicKeyNative,
        crs: crsNative,
    });
}
//# sourceMappingURL=deserializeGlobalFhePkeParams.js.map