import { bytesToHexLarge } from "../../base/bytes.js";
import { assertGlobalFhePkeParamsOwnedBy } from "../../globalFheKey/GlobalFhePkeParams-p.js";
import {} from "../../types/globalFhePkeParams.js";
export async function serializeGlobalFhePkeParams(fhevmRuntime, parameters) {
    assertGlobalFhePkeParamsOwnedBy(parameters, fhevmRuntime);
    const publicKeyBytes = await fhevmRuntime.encrypt.serializeGlobalFhePublicKey({
        globalFhePublicKey: parameters.publicKey,
    });
    const crsBytes = await fhevmRuntime.encrypt.serializeGlobalFheCrs({
        globalFheCrs: parameters.crs,
    });
    return Object.freeze({
        publicKeyBytes: publicKeyBytes,
        crsBytes: crsBytes,
    });
}
export async function serializeGlobalFhePkeParamsToHex(fhevm, parameters) {
    assertGlobalFhePkeParamsOwnedBy(parameters, fhevm.runtime);
    const publicKeyBytes = await fhevm.runtime.encrypt.serializeGlobalFhePublicKey({
        globalFhePublicKey: parameters.publicKey,
    });
    const crsBytes = await fhevm.runtime.encrypt.serializeGlobalFheCrs({
        globalFheCrs: parameters.crs,
    });
    return Object.freeze({
        publicKeyBytesHex: {
            id: publicKeyBytes.id,
            bytesHex: bytesToHexLarge(publicKeyBytes.bytes, false),
        },
        crsBytesHex: {
            id: crsBytes.id,
            capacity: crsBytes.capacity,
            bytesHex: bytesToHexLarge(crsBytes.bytes, false),
        },
    });
}
//# sourceMappingURL=serializeGlobalFhePkeParams.js.map