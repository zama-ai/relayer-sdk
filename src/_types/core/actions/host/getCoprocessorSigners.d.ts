import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type GetCoprocessorSignersParameters = {
    readonly address: ChecksummedAddress;
};
export type GetCoprocessorSignersReturnType = ChecksummedAddress[];
export declare function getCoprocessorSigners(fhevm: Fhevm, parameters: GetCoprocessorSignersParameters): Promise<GetCoprocessorSignersReturnType>;
//# sourceMappingURL=getCoprocessorSigners.d.ts.map