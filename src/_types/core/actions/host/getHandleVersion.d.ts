import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress, Uint8Number } from "../../types/primitives.js";
export type GetHandleVersionParameters = {
    readonly address: ChecksummedAddress;
};
export type GetHandleVersionReturnType = Uint8Number;
export declare function getHandleVersion(fhevm: Fhevm, parameters: GetHandleVersionParameters): Promise<GetHandleVersionReturnType>;
//# sourceMappingURL=getHandleVersion.d.ts.map