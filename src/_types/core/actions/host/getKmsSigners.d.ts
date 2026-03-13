import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type GetKmsSignersParameters = {
    readonly address: ChecksummedAddress;
};
export type GetKmsSignersReturnType = ChecksummedAddress[];
export declare function getKmsSigners(fhevm: Fhevm, parameters: GetKmsSignersParameters): Promise<GetKmsSignersReturnType>;
//# sourceMappingURL=getKmsSigners.d.ts.map