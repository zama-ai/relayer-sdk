"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverSigners = recoverSigners;
const bytes_js_1 = require("../../base/bytes.js");
async function recoverSigners(fhevm, parameters) {
    const { domain, types, primaryType, signatures, message } = parameters;
    (0, bytes_js_1.assertIsBytes65HexArray)(signatures, { subject: "signatures" });
    const fields = types[primaryType];
    if (fields === undefined) {
        throw new Error(`Primary type "${primaryType}" not found in types`);
    }
    const recoveredAddresses = await Promise.all(signatures.map((signature) => fhevm.runtime.ethereum.recoverTypedDataAddress({
        signature,
        domain,
        primaryType,
        types: {
            [primaryType]: [...fields],
        },
        message,
    })));
    return recoveredAddresses;
}
//# sourceMappingURL=recoverSigners.js.map