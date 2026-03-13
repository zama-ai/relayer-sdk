"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeGlobalFhePkeParams = serializeGlobalFhePkeParams;
exports.serializeGlobalFhePkeParamsToHex = serializeGlobalFhePkeParamsToHex;
const bytes_js_1 = require("../../base/bytes.js");
const GlobalFhePkeParams_p_js_1 = require("../../globalFheKey/GlobalFhePkeParams-p.js");
async function serializeGlobalFhePkeParams(fhevmRuntime, parameters) {
    (0, GlobalFhePkeParams_p_js_1.assertGlobalFhePkeParamsOwnedBy)(parameters, fhevmRuntime);
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
async function serializeGlobalFhePkeParamsToHex(fhevm, parameters) {
    (0, GlobalFhePkeParams_p_js_1.assertGlobalFhePkeParamsOwnedBy)(parameters, fhevm.runtime);
    const publicKeyBytes = await fhevm.runtime.encrypt.serializeGlobalFhePublicKey({
        globalFhePublicKey: parameters.publicKey,
    });
    const crsBytes = await fhevm.runtime.encrypt.serializeGlobalFheCrs({
        globalFheCrs: parameters.crs,
    });
    return Object.freeze({
        publicKeyBytesHex: {
            id: publicKeyBytes.id,
            bytesHex: (0, bytes_js_1.bytesToHexLarge)(publicKeyBytes.bytes, false),
        },
        crsBytesHex: {
            id: crsBytes.id,
            capacity: crsBytes.capacity,
            bytesHex: (0, bytes_js_1.bytesToHexLarge)(crsBytes.bytes, false),
        },
    });
}
//# sourceMappingURL=serializeGlobalFhePkeParams.js.map