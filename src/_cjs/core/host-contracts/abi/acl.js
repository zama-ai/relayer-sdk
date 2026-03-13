"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AclPartialAbi = void 0;
exports.AclPartialAbi = [
    {
        inputs: [],
        name: "getFHEVMExecutorAddress",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "handle",
                type: "bytes32",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "persistAllowed",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "handle",
                type: "bytes32",
            },
        ],
        name: "isAllowedForDecryption",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
//# sourceMappingURL=acl.js.map