"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFhevmDecryptClient = createFhevmDecryptClient;
const decrypt_js_1 = require("./decorators/decrypt.js");
const CoreFhevm_p_js_1 = require("../runtime/CoreFhevm-p.js");
function createFhevmDecryptClient(ownerToken, parameters) {
    const c = (0, CoreFhevm_p_js_1.createCoreFhevm)(ownerToken, parameters);
    return (0, CoreFhevm_p_js_1.extendCoreFhevm)(c, decrypt_js_1.decryptActions);
}
//# sourceMappingURL=fhevmDecryptClient.js.map