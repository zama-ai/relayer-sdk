import { InputProofError } from "../../errors/InputProofError.js";
import { assertFhevmHandleArrayEquals } from "../../handle/FhevmHandle.js";
import { createVerifiedInputProofFromComponents } from "./createVerifiedInputProofFromComponents.js";
export async function fetchVerifiedInputProof(fhevm, parameters) {
    const { zkProof, extraData, options } = parameters;
    // 1. extract FhevmHandles from the given ZK proof
    const fhevmHandles = zkProof.getFhevmHandles();
    if (fhevmHandles.length === 0) {
        throw new InputProofError({
            message: `Input proof must contain at least one external handle`,
        });
    }
    // 2. Request coprocessor signatures from the relayer for the given ZK proof
    const { handles: coprocessorSignedHandles, coprocessorEIP712Signatures: coprocessorSignatures, } = await fhevm.runtime.relayer.fetchCoprocessorSignatures({ relayerUrl: fhevm.chain.fhevm.relayerUrl }, {
        payload: {
            zkProof,
            extraData,
        },
        options,
    });
    // 3. Check that the handles and the one in the fetch result
    // Note: this check is theoretically unecessary
    // We prefer to perform this test since we do not trust the relayer
    // The purpose is to check if the relayer is possibly malicious
    assertFhevmHandleArrayEquals(fhevmHandles, coprocessorSignedHandles);
    // 4. Verify ZK proof and Compute the final Input proof
    return await createVerifiedInputProofFromComponents(fhevm, {
        coprocessorEIP712Signatures: coprocessorSignatures,
        externalHandles: fhevmHandles,
        extraData: extraData,
        coprocessorSignedParams: {
            userAddress: zkProof.userAddress,
            contractAddress: zkProof.contractAddress,
        },
    });
}
//# sourceMappingURL=fetchVerifiedInputProof.js.map