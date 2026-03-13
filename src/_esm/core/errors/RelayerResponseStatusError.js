import { humanReadableOperation } from "./RelayerErrorBase.js";
import { RelayerResponseErrorBase } from "./RelayerResponseErrorBase.js";
/**
 * The response status is unexpected.
 */
export class RelayerResponseStatusError extends RelayerResponseErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "RelayerResponseStatusError",
            message: `${humanReadableOperation(params.operation, true)}: Relayer returned unexpected response status: ${params.status}`,
            details: `The Relayer server returned an unexpected response status (${params.status}). This status ${params.status} is not part of the expected API contract and may indicate a server configuration issue.`,
        });
    }
}
//# sourceMappingURL=RelayerResponseStatusError.js.map