import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { FhevmDecryptionKey } from "./FhevmDecryptionKey-p.js";
import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
import type { FhevmUser } from "../types/fhevmUser.js";
import type { ChecksummedAddress, Bytes } from "../types/primitives.js";
import type { TkmsPrivateKey } from "../types/tkms-p.js";
import type { WithDecryptModule, WithTkmsKeyModule } from "../modules/decrypt/types.js";
/** Type guard: returns true if value was created by {@link createFhevmUser}. */
export declare function isFhevmUser(value: unknown): value is FhevmUser;
/** Throws {@link InvalidTypeError} if value is not a valid {@link FhevmUser}. */
export declare function assertIsFhevmUser(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is FhevmUser;
/** Creates a {@link FhevmUser} by binding an address and a private key into an immutable object. */
export declare function createFhevmUser(fhevmRuntime: FhevmRuntime<WithTkmsKeyModule & WithDecryptModule>, parameters: {
    address: ChecksummedAddress;
    privateKey: Bytes | TkmsPrivateKey | FhevmDecryptionKey;
}): Promise<FhevmUser>;
//# sourceMappingURL=FhevmUser-p.d.ts.map