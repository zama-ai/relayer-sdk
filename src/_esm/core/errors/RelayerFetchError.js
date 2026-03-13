import { ensureError } from "../base/errors/utils.js";
import { RelayerFetchErrorBase } from "./RelayerFetchErrorBase.js";
import { formatFetchErrorMetaMessages } from "../base/fetch.js";
/**
 * If a network error occurs or JSON parsing fails.
 */
export class RelayerFetchError extends RelayerFetchErrorBase {
    constructor({ cause, ...params }) {
        super({
            ...params,
            name: "RelayerFetchError",
            message: params.message,
            ...(cause !== undefined ? { cause: ensureError(cause) } : {}),
            ...(cause !== undefined
                ? { metaMessages: formatFetchErrorMetaMessages(cause) }
                : {}),
        });
    }
}
//# sourceMappingURL=RelayerFetchError.js.map