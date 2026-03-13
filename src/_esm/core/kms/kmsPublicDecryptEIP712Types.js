////////////////////////////////////////////////////////////////////////////////
// KmsPublicDecryptEIP712Types
////////////////////////////////////////////////////////////////////////////////
export const kmsPublicDecryptEIP712Types = {
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
Object.freeze(kmsPublicDecryptEIP712Types);
Object.freeze(kmsPublicDecryptEIP712Types.EIP712Domain);
Object.freeze(kmsPublicDecryptEIP712Types.PublicDecryptVerification);
kmsPublicDecryptEIP712Types.EIP712Domain.forEach(Object.freeze);
kmsPublicDecryptEIP712Types.PublicDecryptVerification.forEach(Object.freeze);
//# sourceMappingURL=kmsPublicDecryptEIP712Types.js.map