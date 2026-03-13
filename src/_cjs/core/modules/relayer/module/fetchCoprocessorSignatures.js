"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCoprocessorSignatures = fetchCoprocessorSignatures;
const bytes_js_1 = require("../../../base/bytes.js");
const string_js_1 = require("../../../base/string.js");
const uint_js_1 = require("../../../base/uint.js");
const RelayerAsyncRequest_js_1 = require("./RelayerAsyncRequest.js");
async function fetchCoprocessorSignatures(relayerClient, parameters) {
    const { options, payload } = parameters;
    const relayerOptions = options;
    const inputProofPayload = {
        ciphertextWithInputVerification: (0, bytes_js_1.bytesToHexNo0x)(payload.zkProof.ciphertextWithZkProof),
        contractAddress: payload.zkProof.contractAddress,
        contractChainId: (0, uint_js_1.uintToHex0x)(payload.zkProof.chainId),
        extraData: payload.extraData,
        userAddress: payload.zkProof.userAddress,
    };
    const request = new RelayerAsyncRequest_js_1.RelayerAsyncRequest({
        relayerOperation: "INPUT_PROOF",
        url: `${(0, string_js_1.removeSuffix)(relayerClient.relayerUrl, "/")}/input-proof`,
        payload: inputProofPayload,
        options: relayerOptions,
    });
    const result = (await request.run());
    return {
        handles: result.handles,
        coprocessorEIP712Signatures: result.signatures,
        extraData: result.extraData,
    };
}
//# sourceMappingURL=fetchCoprocessorSignatures.js.map