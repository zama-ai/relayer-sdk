import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type GetFHEVMExecutorAddressParameters = {
    readonly address: ChecksummedAddress;
};
export type GetFHEVMExecutorAddressReturnType = ChecksummedAddress;
export declare function getFHEVMExecutorAddress(fhevm: Fhevm, parameters: GetFHEVMExecutorAddressParameters): Promise<GetFHEVMExecutorAddressReturnType>;
//# sourceMappingURL=getFHEVMExecutorAddress.d.ts.map