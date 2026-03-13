import { RelayerRequestErrorBase } from "./RelayerRequestErrorBase.js";
import { humanReadableOperation } from "./RelayerErrorBase.js";
/**
 * The request timed out. (Global)
 */
export class RelayerTimeoutError extends RelayerRequestErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerTimeoutError",
            message: `${humanReadableOperation(params.operation, true)}: Request timed out after ${params.timeoutMs}ms`,
        });
    }
}
//# sourceMappingURL=RelayerTimeoutError.js.map