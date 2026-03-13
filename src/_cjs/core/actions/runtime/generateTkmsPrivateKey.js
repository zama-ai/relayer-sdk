"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTkmsPrivateKey = generateTkmsPrivateKey;
const bytes_js_1 = require("../../base/bytes.js");
async function generateTkmsPrivateKey(fhevm) {
    const tkmsPrivateKey = await fhevm.runtime.tkmsKey.generateTkmsPrivateKey();
    const tkmsPrivateKeyBytes = await fhevm.runtime.tkmsKey.serializeTkmsPrivateKey({ tkmsPrivateKey });
    return (0, bytes_js_1.bytesToHexLarge)(tkmsPrivateKeyBytes, false);
}
//# sourceMappingURL=generateTkmsPrivateKey.js.map