////////////////////////////////////////////////////////////////////////////////
// ACL.getFHEVMExecutorAddress()
////////////////////////////////////////////////////////////////////////////////
export const getFHEVMExecutorAddressAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// FHEVMExecutor.getACLAddress()
////////////////////////////////////////////////////////////////////////////////
export const getACLAddressAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// FHEVMExecutor.getHCULimitAddress()
////////////////////////////////////////////////////////////////////////////////
export const getHCULimitAddressAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// FHEVMExecutor.getHandleVersion()
////////////////////////////////////////////////////////////////////////////////
export const getHandleVersionAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// FHEVMExecutor.getInputVerifierAddress()
////////////////////////////////////////////////////////////////////////////////
export const getInputVerifierAddressAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// KMSVerifier.eip712Domain()
// InputVerifier.eip712Domain()
////////////////////////////////////////////////////////////////////////////////
export const eip712DomainAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// KMSVerifier.getThreshold()
// InputVerifier.getThreshold()
////////////////////////////////////////////////////////////////////////////////
export const getThresholdAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// KMSVerifier.getKmsSigners()
////////////////////////////////////////////////////////////////////////////////
export const getKmsSignersAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// InputVerifier.getCoprocessorSigners()
////////////////////////////////////////////////////////////////////////////////
export const getCoprocessorSignersAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// ACL.persistAllowed(handle, account)
////////////////////////////////////////////////////////////////////////////////
export const persistAllowedAbi = [
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
////////////////////////////////////////////////////////////////////////////////
// ACL.isAllowedForDecryption(handle)
////////////////////////////////////////////////////////////////////////////////
export const isAllowedForDecryptionAbi = [
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