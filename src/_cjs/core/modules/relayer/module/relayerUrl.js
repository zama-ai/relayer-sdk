"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZamaSepoliaRelayerUrlV2 = exports.ZamaSepoliaRelayerBaseUrl = exports.ZamaMainnetRelayerUrlV2 = exports.ZamaMainnetRelayerBaseUrl = void 0;
exports.parseZamaRelayerUrl = parseZamaRelayerUrl;
const string_js_1 = require("../../../base/string.js");
exports.ZamaMainnetRelayerBaseUrl = "https://relayer.mainnet.zama.org";
exports.ZamaMainnetRelayerUrlV2 = `${exports.ZamaMainnetRelayerBaseUrl}/v2`;
exports.ZamaSepoliaRelayerBaseUrl = "https://relayer.testnet.zama.org";
exports.ZamaSepoliaRelayerUrlV2 = `${exports.ZamaSepoliaRelayerBaseUrl}/v2`;
function parseZamaRelayerUrl(relayerUrl) {
    if (relayerUrl === undefined ||
        relayerUrl === null ||
        typeof relayerUrl !== "string") {
        return null;
    }
    const urlNoSlash = (0, string_js_1.removeSuffix)(relayerUrl, "/");
    if (!URL.canParse(urlNoSlash)) {
        return null;
    }
    if (urlNoSlash.startsWith(exports.ZamaMainnetRelayerBaseUrl) ||
        urlNoSlash.startsWith(exports.ZamaSepoliaRelayerBaseUrl)) {
        const zamaUrls = [
            exports.ZamaSepoliaRelayerBaseUrl,
            exports.ZamaSepoliaRelayerUrlV2,
            exports.ZamaMainnetRelayerBaseUrl,
            exports.ZamaMainnetRelayerUrlV2,
        ];
        const isZamaUrl = zamaUrls.includes(urlNoSlash);
        if (isZamaUrl) {
            if (urlNoSlash.endsWith("/v2")) {
                return urlNoSlash;
            }
            return `${urlNoSlash}/v2`;
        }
        return null;
    }
    return urlNoSlash;
}
//# sourceMappingURL=relayerUrl.js.map