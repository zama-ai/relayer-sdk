"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerifiedInputProofFromRawBytes = createVerifiedInputProofFromRawBytes;
const InputProof_p_js_1 = require("../../coprocessor/InputProof-p.js");
const verifyInputProof_js_1 = require("./verifyInputProof.js");
async function createVerifiedInputProofFromRawBytes(fhevm, parameters) {
    const inputProof = (0, InputProof_p_js_1.createInputProofFromRawBytes)(parameters);
    return await (0, verifyInputProof_js_1.verifyInputProof)(fhevm, { inputProof });
}
//# sourceMappingURL=createVerifiedInputProofFromRawBytes.js.map