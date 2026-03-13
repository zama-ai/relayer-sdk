import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress, Uint64BigInt } from "../../types/primitives.js";
export type Eip712DomainParameters = {
    readonly address: ChecksummedAddress;
};
export type Eip712DomainReturnType = {
    name: string;
    version: string;
    chainId: Uint64BigInt;
    verifyingContract: ChecksummedAddress;
};
export declare function eip712Domain(fhevm: Fhevm, parameters: Eip712DomainParameters): Promise<Eip712DomainReturnType>;
//# sourceMappingURL=eip712Domain.d.ts.map