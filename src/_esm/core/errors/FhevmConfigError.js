import { FhevmErrorBase } from "./FhevmErrorBase.js";
export class FhevmConfigError extends FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "FhevmConfigError",
        });
    }
}
//# sourceMappingURL=FhevmConfigError.js.map