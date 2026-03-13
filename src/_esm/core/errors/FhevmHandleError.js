import { FhevmErrorBase } from "./FhevmErrorBase.js";
export class FhevmHandleError extends FhevmErrorBase {
    constructor(params) {
        super({
            message: params.message ??
                (params.handle !== undefined
                    ? `FHEVM Handle "${params.handle}" is invalid.`
                    : `FHEVM Handle is invalid.`),
            name: "FhevmHandleError",
        });
    }
}
//# sourceMappingURL=FhevmHandleError.js.map