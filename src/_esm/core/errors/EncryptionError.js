import { FhevmErrorBase } from "./FhevmErrorBase.js";
export class EncryptionError extends FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "EncryptionError",
        });
    }
}
//# sourceMappingURL=EncryptionError.js.map