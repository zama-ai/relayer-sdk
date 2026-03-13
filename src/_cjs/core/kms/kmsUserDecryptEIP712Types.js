"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kmsUserDecryptEIP712Types = void 0;
exports.kmsUserDecryptEIP712Types = {
    EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
    ],
    UserDecryptRequestVerification: [
        { name: "publicKey", type: "bytes" },
        { name: "contractAddresses", type: "address[]" },
        { name: "startTimestamp", type: "uint256" },
        { name: "durationDays", type: "uint256" },
        { name: "extraData", type: "bytes" },
    ],
};
Object.freeze(exports.kmsUserDecryptEIP712Types);
Object.freeze(exports.kmsUserDecryptEIP712Types.EIP712Domain);
Object.freeze(exports.kmsUserDecryptEIP712Types.UserDecryptRequestVerification);
exports.kmsUserDecryptEIP712Types.EIP712Domain.forEach(Object.freeze);
exports.kmsUserDecryptEIP712Types.UserDecryptRequestVerification.forEach(Object.freeze);
//# sourceMappingURL=kmsUserDecryptEIP712Types.js.map