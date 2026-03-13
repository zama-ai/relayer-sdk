import type { CoprocessorEIP712 } from "../types/coprocessor.js";
import type { FhevmHandleLike } from "../types/fhevmHandle.js";
export type CreateCoprocessorEIP712Parameters = {
    readonly gatewayChainId: number | bigint;
    readonly verifyingContractAddressInputVerification: string;
    readonly handles: readonly FhevmHandleLike[];
    readonly contractChainId: number | bigint;
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly extraData: string;
};
export declare function createCoprocessorEIP712({ gatewayChainId, verifyingContractAddressInputVerification, handles, contractChainId, contractAddress, userAddress, extraData, }: CreateCoprocessorEIP712Parameters): CoprocessorEIP712;
//# sourceMappingURL=createCoprocessorEIP712.d.ts.map