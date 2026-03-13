"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuth = setAuth;
const string_js_1 = require("./string.js");
function setAuth(init, auth) {
    if (auth) {
        switch (auth.type) {
            case "BearerToken": {
                init.headers.Authorization =
                    `Bearer ${auth.token}`;
                break;
            }
            case "ApiKeyHeader": {
                const h = (0, string_js_1.isNonEmptyString)(auth.header) ? auth.header : "x-api-key";
                init.headers[h] = auth.value;
                break;
            }
            case "ApiKeyCookie": {
                const h = (0, string_js_1.isNonEmptyString)(auth.cookie) ? auth.cookie : "x-api-key";
                if (typeof window !== "undefined") {
                    document.cookie = `${h}=${auth.value}; path=/; SameSite=Lax; Secure; HttpOnly;`;
                    init.credentials = "include";
                }
                else {
                    init.headers.Cookie =
                        `${h}=${auth.value};`;
                }
                break;
            }
        }
    }
    return init;
}
//# sourceMappingURL=auth.js.map