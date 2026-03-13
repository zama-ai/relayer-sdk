import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
import type { FhevmHandle } from "../../../types/fhevmHandle.js";
import type { Bytes65Hex, BytesHex } from "../../../types/primitives.js";
export type VerifyKmsPublicDecryptEIP712Parameters = {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedAbiEncodedClearValues: BytesHex;
    readonly kmsPublicDecryptEIP712Signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
};
export declare function verifyKmsPublicDecryptEIP712(fhevm: Fhevm<FhevmChain>, parameters: VerifyKmsPublicDecryptEIP712Parameters): Promise<void>;
//# sourceMappingURL=verifyKmsPublicDecryptEIP712.d.ts.map