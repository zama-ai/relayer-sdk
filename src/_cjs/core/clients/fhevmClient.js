"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFhevmClient = createFhevmClient;
const encrypt_js_1 = require("./decorators/encrypt.js");
const globalFhePke_js_1 = require("./decorators/globalFhePke.js");
const decrypt_js_1 = require("./decorators/decrypt.js");
const CoreFhevm_p_js_1 = require("../runtime/CoreFhevm-p.js");
function createFhevmClient(ownerToken, parameters) {
    const c = (0, CoreFhevm_p_js_1.createCoreFhevm)(ownerToken, parameters);
    const cEnc = (0, CoreFhevm_p_js_1.extendCoreFhevm)(c, encrypt_js_1.encryptActions);
    const cDec = (0, CoreFhevm_p_js_1.extendCoreFhevm)(cEnc, decrypt_js_1.decryptActions);
    return (0, CoreFhevm_p_js_1.extendCoreFhevm)(cDec, globalFhePke_js_1.globalFhePkeActions);
}
//# sourceMappingURL=fhevmClient.js.map