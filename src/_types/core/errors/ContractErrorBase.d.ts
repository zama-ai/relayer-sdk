import type { Prettify } from "../types/utils.js";
import type { Address } from "../types/primitives.js";
import type { FhevmErrorBaseParams } from "./FhevmErrorBase.js";
import { FhevmErrorBase } from "./FhevmErrorBase.js";
export type ContractErrorBaseType = ContractErrorBase & {
    name: "ContractErrorBase";
};
export type ContractErrorBaseParams = Prettify<FhevmErrorBaseParams & {
    contractAddress: Address;
    contractName: string;
}>;
export declare abstract class ContractErrorBase extends FhevmErrorBase {
    #private;
    constructor(params: ContractErrorBaseParams);
    get contractAddress(): Address;
    get contractName(): string;
}
//# sourceMappingURL=ContractErrorBase.d.ts.map