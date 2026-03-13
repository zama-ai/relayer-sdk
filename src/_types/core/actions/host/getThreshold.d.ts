import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress, Uint8Number } from "../../types/primitives.js";
export type GetThresholdParameters = {
    readonly address: ChecksummedAddress;
};
export type GetThresholdReturnType = Uint8Number;
export declare function getThreshold(fhevm: Fhevm, parameters: GetThresholdParameters): Promise<GetThresholdReturnType>;
//# sourceMappingURL=getThreshold.d.ts.map