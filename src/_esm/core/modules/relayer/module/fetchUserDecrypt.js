import { remove0x, removeSuffix } from "../../../base/string.js";
import { RelayerAsyncRequest } from "./RelayerAsyncRequest.js";
//////////////////////////////////////////////////////////////////////////////
// fetchUserDecrypt
//////////////////////////////////////////////////////////////////////////////
export async function fetchUserDecrypt(relayerClient, parameters) {
    const { options, payload } = parameters;
    const relayerOptions = options;
    const firstHandleContractPair = payload.handleContractPairs[0];
    if (firstHandleContractPair === undefined) {
        throw new Error("Empty handle contract pairs");
    }
    // retreive chainId using handles
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
        signature: remove0x(payload.kmsUserDecryptEIP712Signature),
        extraData: payload.kmsUserDecryptEIP712Message.extraData,
        publicKey: remove0x(payload.kmsUserDecryptEIP712Message.publicKey),
    };
    const request = new RelayerAsyncRequest({
        relayerOperation: "USER_DECRYPT",
        url: `${removeSuffix(relayerClient.relayerUrl, "/")}/user-decrypt`,
        payload: userDecryptPayload,
        options: relayerOptions,
    });
    const result = (await request.run());
    return result;
}
//# sourceMappingURL=fetchUserDecrypt.js.map