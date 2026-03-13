import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { FhevmHandle } from "../../types/fhevmHandle.js";
import type { Bytes65Hex, BytesHex, ChecksummedAddress, Uint64BigInt } from "../../types/primitives.js";
export type VerifyHandlesCoprocessorSignaturesParameters = {
    readonly coprocessorSignatures: readonly Bytes65Hex[];
    readonly handles: readonly FhevmHandle[];
    readonly userAddress: ChecksummedAddress;
    readonly contractAddress: ChecksummedAddress;
    readonly chainId: Uint64BigInt;
    readonly extraData: BytesHex;
};
export declare function verifyHandlesCoprocessorSignatures(fhevm: Fhevm<FhevmChain>, parameters: VerifyHandlesCoprocessorSignaturesParameters): Promise<void>;
//# sourceMappingURL=verifyHandlesCoprocessorSignatures.d.ts.map