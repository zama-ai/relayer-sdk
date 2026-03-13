import { RelayerRequestErrorBase } from "./RelayerRequestErrorBase.js";
import { humanReadableOperation } from "./RelayerErrorBase.js";
/**
 * Request was aborted.
 */
export class RelayerAbortError extends RelayerRequestErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerAbortError",
            message: `${humanReadableOperation(params.operation, true)}: Request aborted`,
        });
    }
}
//# sourceMappingURL=RelayerAbortError.js.map