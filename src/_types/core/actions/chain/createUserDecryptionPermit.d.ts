import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { FhevmUserDecryptionPermit } from "../../types/fhevmUserDecryptionPermit.js";
import type { KmsUserDecryptEIP712 } from "../../types/kms.js";
import type { Bytes65Hex, ChecksummedAddress } from "../../types/primitives.js";
export type CreateUserDecryptionPermitParameters = {
    readonly signerAddress: ChecksummedAddress;
    readonly eip712: KmsUserDecryptEIP712;
    readonly signature: Bytes65Hex;
};
export type CreateUserDecryptionPermitReturnType = FhevmUserDecryptionPermit;
export declare function createUserDecryptionPermit(fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>, parameters: CreateUserDecryptionPermitParameters): Promise<CreateUserDecryptionPermitReturnType>;
//# sourceMappingURL=createUserDecryptionPermit.d.ts.map