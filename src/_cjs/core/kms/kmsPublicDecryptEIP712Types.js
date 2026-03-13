"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kmsPublicDecryptEIP712Types = void 0;
exports.kmsPublicDecryptEIP712Types = {
    EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
    ],
    PublicDecryptVerification: [
        { name: "ctHandles", type: "bytes32[]" },
        { name: "decryptedResult", type: "bytes" },
        { name: "extraData", type: "bytes" },
    ],
};
Object.freeze(exports.kmsPublicDecryptEIP712Types);
Object.freeze(exports.kmsPublicDecryptEIP712Types.EIP712Domain);
Object.freeze(exports.kmsPublicDecryptEIP712Types.PublicDecryptVerification);
exports.kmsPublicDecryptEIP712Types.EIP712Domain.forEach(Object.freeze);
exports.kmsPublicDecryptEIP712Types.PublicDecryptVerification.forEach(Object.freeze);
//# sourceMappingURL=kmsPublicDecryptEIP712Types.js.map