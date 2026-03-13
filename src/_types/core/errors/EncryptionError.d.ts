import type { FhevmErrorBaseParams } from "./FhevmErrorBase.js";
import type { Prettify } from "../types/utils.js";
import { FhevmErrorBase } from "./FhevmErrorBase.js";
export type EncryptionErrorType = EncryptionError & {
    name: "EncryptionError";
};
export type EncryptionErrorParams = Prettify<Omit<FhevmErrorBaseParams, "name">>;
export declare class EncryptionError extends FhevmErrorBase {
    constructor(params: EncryptionErrorParams);
}
//# sourceMappingURL=EncryptionError.d.ts.map