import { bytesToHexNo0x } from "../../../base/bytes.js";
import { removeSuffix } from "../../../base/string.js";
import { uintToHex0x } from "../../../base/uint.js";
import { RelayerAsyncRequest } from "./RelayerAsyncRequest.js";
////////////////////////////////////////////////////////////////////////////////
// fetchCoprocessorSignatures
////////////////////////////////////////////////////////////////////////////////
export async function fetchCoprocessorSignatures(relayerClient, parameters) {
    const { options, payload } = parameters;
    const relayerOptions = options;
    const inputProofPayload = {
        ciphertextWithInputVerification: bytesToHexNo0x(payload.zkProof.ciphertextWithZkProof),
        contractAddress: payload.zkProof.contractAddress,
        contractChainId: uintToHex0x(payload.zkProof.chainId),
        extraData: payload.extraData,
        userAddress: payload.zkProof.userAddress,
    };
    const request = new RelayerAsyncRequest({
        relayerOperation: "INPUT_PROOF",
        url: `${removeSuffix(relayerClient.relayerUrl, "/")}/input-proof`,
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