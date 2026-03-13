"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerFetchError = void 0;
const utils_js_1 = require("../base/errors/utils.js");
const RelayerFetchErrorBase_js_1 = require("./RelayerFetchErrorBase.js");
const fetch_js_1 = require("../base/fetch.js");
class RelayerFetchError extends RelayerFetchErrorBase_js_1.RelayerFetchErrorBase {
    constructor({ cause, ...params }) {
        super({
            ...params,
            name: "RelayerFetchError",
            message: params.message,
            ...(cause !== undefined ? { cause: (0, utils_js_1.ensureError)(cause) } : {}),
            ...(cause !== undefined
                ? { metaMessages: (0, fetch_js_1.formatFetchErrorMetaMessages)(cause) }
                : {}),
        });
    }
}
exports.RelayerFetchError = RelayerFetchError;
//# sourceMappingURL=RelayerFetchError.js.map