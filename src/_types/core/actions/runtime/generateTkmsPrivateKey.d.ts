import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { WithTkmsKey } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { BytesHex } from "../../types/primitives.js";
export type GenerateTkmsPrivateKeyReturnType = BytesHex;
export declare function generateTkmsPrivateKey(fhevm: Fhevm<FhevmChain | undefined, WithTkmsKey, OptionalNativeClient>): Promise<GenerateTkmsPrivateKeyReturnType>;
//# sourceMappingURL=generateTkmsPrivateKey.d.ts.map