import { FhevmErrorBase } from "./FhevmErrorBase.js";
export class TFHEError extends FhevmErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "TFHEError",
        });
    }
}
//# sourceMappingURL=TFHEError.js.map