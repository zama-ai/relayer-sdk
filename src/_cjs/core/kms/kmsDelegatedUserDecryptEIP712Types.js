"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kmsDelegatedUserDecryptEIP712Types = void 0;
exports.kmsDelegatedUserDecryptEIP712Types = {
    EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
    ],
    DelegatedUserDecryptRequestVerification: [
        { name: "publicKey", type: "bytes" },
        { name: "contractAddresses", type: "address[]" },
        { name: "startTimestamp", type: "uint256" },
        { name: "durationDays", type: "uint256" },
        { name: "extraData", type: "bytes" },
        { name: "delegatedAccount", type: "address" },
    ],
};
Object.freeze(exports.kmsDelegatedUserDecryptEIP712Types);
Object.freeze(exports.kmsDelegatedUserDecryptEIP712Types.EIP712Domain);
Object.freeze(exports.kmsDelegatedUserDecryptEIP712Types.DelegatedUserDecryptRequestVerification);
exports.kmsDelegatedUserDecryptEIP712Types.EIP712Domain.forEach(Object.freeze);
exports.kmsDelegatedUserDecryptEIP712Types.DelegatedUserDecryptRequestVerification.forEach(Object.freeze);
//# sourceMappingURL=kmsDelegatedUserDecryptEIP712Types.js.map