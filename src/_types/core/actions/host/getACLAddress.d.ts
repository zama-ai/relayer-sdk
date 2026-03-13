import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type GetACLAddressParameters = {
    readonly address: ChecksummedAddress;
};
export type GetACLAddressReturnType = ChecksummedAddress;
export declare function getACLAddress(fhevm: Fhevm, parameters: GetACLAddressParameters): Promise<GetACLAddressReturnType>;
//# sourceMappingURL=getACLAddress.d.ts.map