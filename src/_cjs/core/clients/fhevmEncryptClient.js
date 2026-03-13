"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFhevmEncryptClient = createFhevmEncryptClient;
const encrypt_js_1 = require("./decorators/encrypt.js");
const CoreFhevm_p_js_1 = require("../runtime/CoreFhevm-p.js");
const globalFhePke_js_1 = require("./decorators/globalFhePke.js");
function createFhevmEncryptClient(ownerToken, parameters) {
    const c = (0, CoreFhevm_p_js_1.createCoreFhevm)(ownerToken, parameters);
    const cEnc = (0, CoreFhevm_p_js_1.extendCoreFhevm)(c, encrypt_js_1.encryptActions);
    return (0, CoreFhevm_p_js_1.extendCoreFhevm)(cEnc, globalFhePke_js_1.globalFhePkeActions);
}
//# sourceMappingURL=fhevmEncryptClient.js.map