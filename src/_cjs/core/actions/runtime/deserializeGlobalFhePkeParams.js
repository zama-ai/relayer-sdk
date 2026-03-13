"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeGlobalFhePkeParams = deserializeGlobalFhePkeParams;
exports.deserializeGlobalFhePkeParamsFromHex = deserializeGlobalFhePkeParamsFromHex;
const bytes_js_1 = require("../../base/bytes.js");
const GlobalFhePkeParams_p_js_1 = require("../../globalFheKey/GlobalFhePkeParams-p.js");
async function deserializeGlobalFhePkeParams(fhevm, parameters) {
    const publicKeyNative = await fhevm.runtime.encrypt.deserializeGlobalFhePublicKey({
        globalFhePublicKeyBytes: parameters.publicKeyBytes,
    });
    const crsNative = await fhevm.runtime.encrypt.deserializeGlobalFheCrs({
        globalFheCrsBytes: parameters.crsBytes,
    });
    return (0, GlobalFhePkeParams_p_js_1.createGlobalFhePkeParams)(new WeakRef(fhevm.runtime), {
        publicKey: publicKeyNative,
        crs: crsNative,
    });
}
async function deserializeGlobalFhePkeParamsFromHex(fhevm, parameters) {
    const publicKeyNative = await fhevm.runtime.encrypt.deserializeGlobalFhePublicKey({
        globalFhePublicKeyBytes: {
            id: parameters.publicKeyBytesHex.id,
            bytes: (0, bytes_js_1.hexToBytesFaster)(parameters.publicKeyBytesHex.bytesHex, {
                strict: true,
            }),
        },
    });
    const crsNative = await fhevm.runtime.encrypt.deserializeGlobalFheCrs({
        globalFheCrsBytes: {
            id: parameters.crsBytesHex.id,
            capacity: parameters.crsBytesHex.capacity,
            bytes: (0, bytes_js_1.hexToBytesFaster)(parameters.crsBytesHex.bytesHex, {
                strict: true,
            }),
        },
    });
    return (0, GlobalFhePkeParams_p_js_1.createGlobalFhePkeParams)(new WeakRef(fhevm.runtime), {
        publicKey: publicKeyNative,
        crs: crsNative,
    });
}
//# sourceMappingURL=deserializeGlobalFhePkeParams.js.map