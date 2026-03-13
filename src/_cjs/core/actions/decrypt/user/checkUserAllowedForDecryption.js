"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserAllowedForDecryption = checkUserAllowedForDecryption;
const address_js_1 = require("../../../base/address.js");
const ACLError_js_1 = require("../../../errors/ACLError.js");
const FhevmHandle_js_1 = require("../../../handle/FhevmHandle.js");
const persistAllowed_js_1 = require("./persistAllowed.js");
async function checkUserAllowedForDecryption(fhevm, parameters) {
    function getKey(address, handleBytes32Hex) {
        return `${address}:${handleBytes32Hex}`.toLowerCase();
    }
    const pairsArray = Array.isArray(parameters.handleContractPairs)
        ? parameters.handleContractPairs
        : [parameters.handleContractPairs];
    if (parameters.options?.checkArguments !== false) {
        (0, address_js_1.assertIsChecksummedAddress)(parameters.userAddress, {});
        for (const pair of pairsArray) {
            (0, FhevmHandle_js_1.assertIsFhevmHandleLike)(pair.handle);
            (0, address_js_1.assertIsChecksummedAddress)(pair.contractAddress, {});
        }
    }
    for (const pair of pairsArray) {
        if (parameters.userAddress.toLowerCase() ===
            pair.contractAddress.toLowerCase()) {
            throw new ACLError_js_1.ACLUserDecryptionError({
                contractAddress: fhevm.chain.fhevm.contracts.acl
                    .address,
                message: `userAddress ${parameters.userAddress} should not be equal to contractAddress when requesting user decryption!`,
            });
        }
    }
    const pairsArrayHex = pairsArray.map((pair) => ({
        contractAddress: pair.contractAddress,
        handleBytes32Hex: (0, FhevmHandle_js_1.toFhevmHandle)(pair.handle).bytes32Hex,
    }));
    const allChecks = [];
    const seenKeys = new Set();
    for (const pair of pairsArrayHex) {
        const userKey = getKey(parameters.userAddress, pair.handleBytes32Hex);
        if (!seenKeys.has(userKey)) {
            seenKeys.add(userKey);
            allChecks.push({
                address: parameters.userAddress,
                handle: pair.handleBytes32Hex,
            });
        }
        const contractKey = getKey(pair.contractAddress, pair.handleBytes32Hex);
        if (!seenKeys.has(contractKey)) {
            seenKeys.add(contractKey);
            allChecks.push({
                address: pair.contractAddress,
                handle: pair.handleBytes32Hex,
            });
        }
    }
    const allResults = await (0, persistAllowed_js_1.persistAllowed)(fhevm, {
        handleAddressPairs: allChecks,
        options: {
            checkArguments: false,
        },
    });
    const resultMap = new Map();
    for (const [i, check] of allChecks.entries()) {
        const result = allResults[i];
        if (result === undefined) {
            throw new Error(`Missing result at index ${i}`);
        }
        const key = getKey(check.address, check.handle);
        resultMap.set(key, result);
    }
    for (const pair of pairsArrayHex) {
        const userKey = getKey(parameters.userAddress, pair.handleBytes32Hex);
        if (resultMap.get(userKey) !== true) {
            throw new ACLError_js_1.ACLUserDecryptionError({
                contractAddress: fhevm.chain.fhevm.contracts.acl
                    .address,
                message: `User ${parameters.userAddress} is not authorized to decrypt handle ${pair.handleBytes32Hex}!`,
            });
        }
        const contractKey = getKey(pair.contractAddress, pair.handleBytes32Hex);
        if (resultMap.get(contractKey) !== true) {
            throw new ACLError_js_1.ACLUserDecryptionError({
                contractAddress: fhevm.chain.fhevm.contracts.acl
                    .address,
                message: `Dapp contract ${pair.contractAddress} is not authorized to user decrypt handle ${pair.handleBytes32Hex}!`,
            });
        }
    }
}
//# sourceMappingURL=checkUserAllowedForDecryption.js.map