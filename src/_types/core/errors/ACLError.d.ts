import type { Address, Bytes32Hex, ChecksummedAddress } from "../types/primitives.js";
import type { FhevmErrorBaseParams } from "./FhevmErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { ContractErrorBase } from "./ContractErrorBase.js";
export type ACLPublicDecryptionErrorType = ACLPublicDecryptionError & {
    name: "ACLPublicDecryptionError";
};
export type ACLPublicDecryptionErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name"> & {
    handle?: string;
}>;
export declare class ACLPublicDecryptionError extends ContractErrorBase {
    #private;
    constructor({ contractAddress, handles, }: {
        contractAddress: ChecksummedAddress;
        handles: Bytes32Hex[];
    });
    get handles(): Bytes32Hex[];
}
export type ACLUserDecryptionErrorType = ACLUserDecryptionError & {
    name: "ACLUserDecryptionError";
};
export declare class ACLUserDecryptionError extends ContractErrorBase {
    constructor({ contractAddress, message, }: {
        contractAddress: Address;
        message: string;
    });
}
//# sourceMappingURL=ACLError.d.ts.map