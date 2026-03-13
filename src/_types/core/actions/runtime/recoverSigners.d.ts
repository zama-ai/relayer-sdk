import type { RecoverTypedDataAddressModuleFunction } from "../../modules/ethereum/types.js";
import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
type EIP712TypesType = Record<string, ReadonlyArray<{
    name: string;
    type: string;
}>>;
export type RecoverSignersParameters<T extends EIP712TypesType> = {
    readonly domain: Parameters<RecoverTypedDataAddressModuleFunction["recoverTypedDataAddress"]>[0]["domain"];
    readonly types: T;
    readonly primaryType: string & keyof T;
    readonly signatures: readonly string[];
    readonly message: Record<string, unknown>;
};
export type RecoverSignersReturnType = ChecksummedAddress[];
export declare function recoverSigners<T extends Record<string, ReadonlyArray<{
    name: string;
    type: string;
}>>>(fhevm: Fhevm<FhevmChain | undefined, FhevmRuntime, OptionalNativeClient>, parameters: RecoverSignersParameters<T>): Promise<RecoverSignersReturnType>;
export {};
//# sourceMappingURL=recoverSigners.d.ts.map