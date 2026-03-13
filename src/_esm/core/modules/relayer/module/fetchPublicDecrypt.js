import { ensure0x, removeSuffix } from "../../../base/string.js";
import { RelayerAsyncRequest } from "./RelayerAsyncRequest.js";
//////////////////////////////////////////////////////////////////////////////
// fetchPublicDecrypt
//////////////////////////////////////////////////////////////////////////////
export async function fetchPublicDecrypt(relayerClient, parameters) {
    const { options, payload } = parameters;
    const relayerOptions = options;
    // Convert payload argument to relayer payload
    const p = {
        ciphertextHandles: payload.orderedHandles.map((h) => {
            return h.bytes32Hex;
        }),
        extraData: payload.extraData,
    };
    const request = new RelayerAsyncRequest({
        relayerOperation: "PUBLIC_DECRYPT",
        url: `${removeSuffix(relayerClient.relayerUrl, "/")}/v2/public-decrypt`,
        payload: p,
        options: relayerOptions,
    });
    const result = (await request.run());
    return {
        orderedAbiEncodedClearValues: ensure0x(result.decryptedValue),
        kmsPublicDecryptEIP712Signatures: result.signatures.map(ensure0x),
    };
}
//# sourceMappingURL=fetchPublicDecrypt.js.map