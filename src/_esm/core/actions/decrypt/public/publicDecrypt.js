import { assertFhevmHandlesBelongToSameChainId } from "../../../handle/FhevmHandle.js";
import { assertKmsDecryptionBitLimit } from "../../../kms/utils.js";
import { checkAllowedForDecryption } from "./checkAllowedForDecryption.js";
import { createPublicDecryptionProof } from "./createPublicDecryptionProof.js";
export async function publicDecrypt(fhevm, parameters) {
    const fhevmHandles = parameters.handles;
    // 1. Check: At least one handle is required
    if (fhevmHandles.length === 0) {
        throw Error(`handles must not be empty, at least one handle is required`);
    }
    // 2. Check: 2048 bits limit
    assertKmsDecryptionBitLimit(fhevmHandles);
    // 3. Check: All handles belong to the host chainId
    assertFhevmHandlesBelongToSameChainId(fhevmHandles, BigInt(fhevm.chain.id));
    // 4. Check: ACL permissions
    await checkAllowedForDecryption(fhevm, {
        handles: fhevmHandles,
        options: { checkArguments: true },
    });
    // 5. Call relayer
    const { orderedAbiEncodedClearValues, kmsPublicDecryptEIP712Signatures } = await fhevm.runtime.relayer.fetchPublicDecrypt({ relayerUrl: fhevm.chain.fhevm.relayerUrl }, {
        payload: {
            orderedHandles: fhevmHandles,
            extraData: parameters.extraData,
        },
        options: parameters.options,
    });
    ////////////////////////////////////////////////////////////////////////////
    //
    // Warning!!!! Do not use '0x00' here!! Only '0x' is permitted!
    //
    ////////////////////////////////////////////////////////////////////////////
    const signedExtraData = "0x";
    // 6. Verify and Compute PublicDecryptionProof
    const publicDecryptionProof = await createPublicDecryptionProof(fhevm, {
        orderedHandles: fhevmHandles,
        orderedAbiEncodedClearValues,
        kmsPublicDecryptEIP712Signatures,
        extraData: signedExtraData,
    });
    return publicDecryptionProof;
}
//# sourceMappingURL=publicDecrypt.js.map