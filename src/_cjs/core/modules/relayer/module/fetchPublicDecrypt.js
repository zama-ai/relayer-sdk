"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPublicDecrypt = fetchPublicDecrypt;
const string_js_1 = require("../../../base/string.js");
const RelayerAsyncRequest_js_1 = require("./RelayerAsyncRequest.js");
async function fetchPublicDecrypt(relayerClient, parameters) {
    const { options, payload } = parameters;
    const relayerOptions = options;
    const p = {
        ciphertextHandles: payload.orderedHandles.map((h) => {
            return h.bytes32Hex;
        }),
        extraData: payload.extraData,
    };
    const request = new RelayerAsyncRequest_js_1.RelayerAsyncRequest({
        relayerOperation: "PUBLIC_DECRYPT",
        url: `${(0, string_js_1.removeSuffix)(relayerClient.relayerUrl, "/")}/v2/public-decrypt`,
        payload: p,
        options: relayerOptions,
    });
    const result = (await request.run());
    return {
        orderedAbiEncodedClearValues: (0, string_js_1.ensure0x)(result.decryptedValue),
        kmsPublicDecryptEIP712Signatures: result.signatures.map(string_js_1.ensure0x),
    };
}
//# sourceMappingURL=fetchPublicDecrypt.js.map