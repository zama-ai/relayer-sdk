import { RelayerResponseErrorBase } from "./RelayerResponseErrorBase.js";
/**
 * The input proof is rejected.
 */
export class RelayerResponseInputProofRejectedError extends RelayerResponseErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerResponseInputProofRejectedError",
            message: `Relayer rejected the input proof`,
        });
    }
}
//# sourceMappingURL=RelayerResponseInputProofRejectedError.js.map