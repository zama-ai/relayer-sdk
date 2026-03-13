////////////////////////////////////////////////////////////////////////////////
// CoprocessorEIP712Types
////////////////////////////////////////////////////////////////////////////////
/*
    const EIP712DomainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
*/
export const coprocessorEIP712PrimaryType = "CiphertextVerification";
export const coprocessorEIP712Types = {
    // EIP712Domain: [
    //   { name: 'name', type: 'string' },
    //   { name: 'version', type: 'string' },
    //   { name: 'chainId', type: 'uint256' },
    //   { name: 'verifyingContract', type: 'address' },
    // ] as const,
    CiphertextVerification: [
        { name: "ctHandles", type: "bytes32[]" },
        { name: "userAddress", type: "address" },
        { name: "contractAddress", type: "address" },
        { name: "contractChainId", type: "uint256" },
        { name: "extraData", type: "bytes" },
    ],
};
Object.freeze(coprocessorEIP712Types);
Object.freeze(coprocessorEIP712Types.CiphertextVerification);
coprocessorEIP712Types.CiphertextVerification.forEach(Object.freeze);
//# sourceMappingURL=coprocessorEIP712Types.js.map