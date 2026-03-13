import { RelayerFetchErrorBase } from "./RelayerFetchErrorBase.js";
import { humanReadableOperation } from "./RelayerErrorBase.js";
/**
 * The maximum number of retries is exceeded.
 */
export class RelayerMaxRetryError extends RelayerFetchErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerMaxRetryError",
            message: `${humanReadableOperation(params.operation, true)}: Maximum polling retry limit exceeded (${params.retryCount} attempts)`,
            details: `After ${params.retryCount} polling attempts, the retry limit was exceeded. The operation may still complete on the server - consider checking the result later.`,
        });
    }
}
//# sourceMappingURL=RelayerMaxRetryError.js.map