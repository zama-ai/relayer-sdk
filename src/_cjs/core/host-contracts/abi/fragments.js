"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAllowedForDecryptionAbi = exports.persistAllowedAbi = exports.getCoprocessorSignersAbi = exports.getKmsSignersAbi = exports.getThresholdAbi = exports.eip712DomainAbi = exports.getInputVerifierAddressAbi = exports.getHandleVersionAbi = exports.getHCULimitAddressAbi = exports.getACLAddressAbi = exports.getFHEVMExecutorAddressAbi = void 0;
exports.getFHEVMExecutorAddressAbi = [
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
];
exports.getACLAddressAbi = [
    {
        inputs: [],
        name: "getACLAddress",
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
];
exports.getHCULimitAddressAbi = [
    {
        inputs: [],
        name: "getHCULimitAddress",
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
];
exports.getHandleVersionAbi = [
    {
        inputs: [],
        name: "getHandleVersion",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
];
exports.getInputVerifierAddressAbi = [
    {
        inputs: [],
        name: "getInputVerifierAddress",
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
];
exports.eip712DomainAbi = [
    {
        inputs: [],
        name: "eip712Domain",
        outputs: [
            {
                internalType: "bytes1",
                name: "fields",
                type: "bytes1",
            },
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                internalType: "string",
                name: "version",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "verifyingContract",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "salt",
                type: "bytes32",
            },
            {
                internalType: "uint256[]",
                name: "extensions",
                type: "uint256[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
exports.getThresholdAbi = [
    {
        inputs: [],
        name: "getThreshold",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
exports.getKmsSignersAbi = [
    {
        inputs: [],
        name: "getKmsSigners",
        outputs: [
            {
                internalType: "address[]",
                name: "",
                type: "address[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
exports.getCoprocessorSignersAbi = [
    {
        inputs: [],
        name: "getCoprocessorSigners",
        outputs: [
            {
                internalType: "address[]",
                name: "",
                type: "address[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
exports.persistAllowedAbi = [
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
];
exports.isAllowedForDecryptionAbi = [
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
//# sourceMappingURL=fragments.js.map