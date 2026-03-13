import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { Bytes32Hex, ChecksummedAddress } from "../../types/primitives.js";
export type IsAllowedForDecryptionParameters = {
    readonly address: ChecksummedAddress;
    readonly args: {
        readonly handle: Bytes32Hex;
    };
};
export type IsAllowedForDecryptionReturnType = boolean;
export declare function isAllowedForDecryption(fhevm: Fhevm, parameters: IsAllowedForDecryptionParameters): Promise<IsAllowedForDecryptionReturnType>;
//# sourceMappingURL=isAllowedForDecryption.d.ts.map