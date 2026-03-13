import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { Bytes32Hex, ChecksummedAddress } from "../../types/primitives.js";
export type PersistAllowedParameters = {
    readonly address: ChecksummedAddress;
    readonly args: {
        readonly handle: Bytes32Hex;
        readonly account: ChecksummedAddress;
    };
};
export type PersistAllowedReturnType = boolean;
export declare function persistAllowed(fhevm: Fhevm, parameters: PersistAllowedParameters): Promise<PersistAllowedReturnType>;
//# sourceMappingURL=persistAllowed.d.ts.map