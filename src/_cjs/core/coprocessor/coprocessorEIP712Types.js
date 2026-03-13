"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coprocessorEIP712Types = exports.coprocessorEIP712PrimaryType = void 0;
exports.coprocessorEIP712PrimaryType = "CiphertextVerification";
exports.coprocessorEIP712Types = {
    CiphertextVerification: [
        { name: "ctHandles", type: "bytes32[]" },
        { name: "userAddress", type: "address" },
        { name: "contractAddress", type: "address" },
        { name: "contractChainId", type: "uint256" },
        { name: "extraData", type: "bytes" },
    ],
};
Object.freeze(exports.coprocessorEIP712Types);
Object.freeze(exports.coprocessorEIP712Types.CiphertextVerification);
exports.coprocessorEIP712Types.CiphertextVerification.forEach(Object.freeze);
//# sourceMappingURL=coprocessorEIP712Types.js.map