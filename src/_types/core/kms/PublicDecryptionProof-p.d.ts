import type { BytesHex } from "../types/primitives.js";
import type { PublicDecryptionProof } from "../types/publicDecryptionProof.js";
import type { DecryptedFhevmHandle } from "../types/decryptedFhevmHandle.js";
/**
 * @internal
 */
export declare class PublicDecryptionProofImpl implements PublicDecryptionProof {
    #private;
    constructor(params: {
        readonly decryptionProof: BytesHex;
        readonly orderedDecryptedHandles: readonly DecryptedFhevmHandle[];
        readonly orderedAbiEncodedClearValues: BytesHex;
        readonly extraData: BytesHex;
    });
    get decryptionProof(): BytesHex;
    get orderedDecryptedHandles(): readonly DecryptedFhevmHandle[];
    get orderedAbiEncodedClearValues(): BytesHex;
    get extraData(): BytesHex;
}
//# sourceMappingURL=PublicDecryptionProof-p.d.ts.map