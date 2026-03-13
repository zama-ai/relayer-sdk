"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFhevm = createFhevm;
const CoreFhevm_p_js_1 = require("../runtime/CoreFhevm-p.js");
function createFhevm(ownerToken, parameters) {
    const p = {
        options: parameters.options,
        runtime: parameters.runtime,
        chain: parameters.chain,
        client: parameters.client,
    };
    return (0, CoreFhevm_p_js_1.createCoreFhevm)(ownerToken, p);
}
//# sourceMappingURL=fhevm.js.map