"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchKmsSignedcryptedShares = fetchKmsSignedcryptedShares;
const FhevmHandle_js_1 = require("../../../handle/FhevmHandle.js");
const KmsSigncryptedShares_p_js_1 = require("../../../kms/KmsSigncryptedShares-p.js");
const utils_js_1 = require("../../../kms/utils.js");
const readKmsSignersContext_js_1 = require("../readKmsSignersContext.js");
const checkUserAllowedForDecryption_js_1 = require("./checkUserAllowedForDecryption.js");
const createKmsEIP712Domain_js_1 = require("../../chain/createKmsEIP712Domain.js");
const verifyKmsUserDecryptEIP712_js_1 = require("../../chain/verifyKmsUserDecryptEIP712.js");
const MAX_USER_DECRYPT_CONTRACT_ADDRESSES = 10;
const MAX_USER_DECRYPT_DURATION_DAYS = 365;
async function fetchKmsSignedcryptedShares(fhevm, parameters) {
    const { handleContractPairs, userDecryptEIP712Signature, userDecryptEIP712Message, userDecryptEIP712Signer: userAddress, } = parameters;
    if (handleContractPairs.length === 0) {
        throw Error(`handleContractPairs must not be empty, at least one handle/contract pair is required`);
    }
    const contractAddressesLength = userDecryptEIP712Message.contractAddresses.length;
    if (contractAddressesLength === 0) {
        throw Error("contractAddresses is empty");
    }
    if (contractAddressesLength > MAX_USER_DECRYPT_CONTRACT_ADDRESSES) {
        throw Error(`contractAddresses max length of ${MAX_USER_DECRYPT_CONTRACT_ADDRESSES} exceeded`);
    }
    const fhevmHandles = handleContractPairs.map((pair) => pair.handle);
    Object.freeze(fhevmHandles);
    (0, FhevmHandle_js_1.assertFhevmHandlesBelongToSameChainId)(fhevmHandles, BigInt(fhevm.chain.id));
    (0, utils_js_1.assertKmsDecryptionBitLimit)(fhevmHandles);
    (0, utils_js_1.assertKmsEIP712DeadlineValidity)(userDecryptEIP712Message, MAX_USER_DECRYPT_DURATION_DAYS);
    await (0, checkUserAllowedForDecryption_js_1.checkUserAllowedForDecryption)(fhevm, {
        userAddress: parameters.userDecryptEIP712Signer,
        handleContractPairs: parameters.handleContractPairs,
    });
    const kmsUserDecryptEIP712Message = userDecryptEIP712Message;
    await (0, verifyKmsUserDecryptEIP712_js_1.verifyKmsUserDecryptEIP712)(fhevm, {
        signer: parameters.userDecryptEIP712Signer,
        message: kmsUserDecryptEIP712Message,
        signature: userDecryptEIP712Signature,
    });
    const kmsSignersContext = await (0, readKmsSignersContext_js_1.readKmsSignersContext)(fhevm);
    const shares = await fhevm.runtime.relayer.fetchUserDecrypt({ relayerUrl: fhevm.chain.fhevm.relayerUrl }, {
        payload: {
            handleContractPairs,
            kmsUserDecryptEIP712Signer: userAddress,
            kmsUserDecryptEIP712Message,
            kmsUserDecryptEIP712Signature: userDecryptEIP712Signature,
        },
        options: parameters.options,
    });
    const sharesMetadata = {
        kmsSignersContext,
        eip712Domain: (0, createKmsEIP712Domain_js_1.createKmsEIP712Domain)(fhevm),
        eip712Signature: parameters.userDecryptEIP712Signature,
        eip712SignerAddress: userAddress,
        fhevmHandles,
    };
    return (0, KmsSigncryptedShares_p_js_1.createKmsSigncryptedShares)(sharesMetadata, shares);
}
//# sourceMappingURL=fetchKmsSignedcryptedShares.js.map