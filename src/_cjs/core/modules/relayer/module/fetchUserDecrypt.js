"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserDecrypt = fetchUserDecrypt;
const string_js_1 = require("../../../base/string.js");
const RelayerAsyncRequest_js_1 = require("./RelayerAsyncRequest.js");
async function fetchUserDecrypt(relayerClient, parameters) {
    const { options, payload } = parameters;
    const relayerOptions = options;
    const firstHandleContractPair = payload.handleContractPairs[0];
    if (firstHandleContractPair === undefined) {
        throw new Error("Empty handle contract pairs");
    }
    const contractsChainId = firstHandleContractPair.handle.chainId.toString();
    const userDecryptPayload = {
        handleContractPairs: payload.handleContractPairs.map((pair) => {
            return {
                handle: pair.handle.bytes32Hex,
                contractAddress: pair.contractAddress,
            };
        }),
        requestValidity: {
            startTimestamp: payload.kmsUserDecryptEIP712Message.startTimestamp,
            durationDays: payload.kmsUserDecryptEIP712Message.durationDays,
        },
        contractsChainId,
        contractAddresses: payload.kmsUserDecryptEIP712Message.contractAddresses,
        userAddress: payload.kmsUserDecryptEIP712Signer,
        signature: (0, string_js_1.remove0x)(payload.kmsUserDecryptEIP712Signature),
        extraData: payload.kmsUserDecryptEIP712Message.extraData,
        publicKey: (0, string_js_1.remove0x)(payload.kmsUserDecryptEIP712Message.publicKey),
    };
    const request = new RelayerAsyncRequest_js_1.RelayerAsyncRequest({
        relayerOperation: "USER_DECRYPT",
        url: `${(0, string_js_1.removeSuffix)(relayerClient.relayerUrl, "/")}/user-decrypt`,
        payload: userDecryptPayload,
        options: relayerOptions,
    });
    const result = (await request.run());
    return result;
}
//# sourceMappingURL=fetchUserDecrypt.js.map