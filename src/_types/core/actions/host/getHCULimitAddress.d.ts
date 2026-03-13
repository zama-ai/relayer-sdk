import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type GetHCULimitAddressParameters = {
    readonly address: ChecksummedAddress;
};
export type GetHCULimitAddressReturnType = ChecksummedAddress;
export declare function getHCULimitAddress(fhevm: Fhevm, parameters: GetHCULimitAddressParameters): Promise<GetHCULimitAddressReturnType>;
//# sourceMappingURL=getHCULimitAddress.d.ts.map