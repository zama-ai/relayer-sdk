import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type GetInputVerifierAddressParameters = {
    readonly address: ChecksummedAddress;
};
export type GetInputVerifierAddressReturnType = ChecksummedAddress;
export declare function getInputVerifierAddress(fhevm: Fhevm, parameters: GetInputVerifierAddressParameters): Promise<GetInputVerifierAddressReturnType>;
//# sourceMappingURL=getInputVerifierAddress.d.ts.map