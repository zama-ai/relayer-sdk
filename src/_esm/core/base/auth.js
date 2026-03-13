import { isNonEmptyString } from "./string.js";
/**
 * Set the authentication method for the request. The default is no authentication.
 * It supports:
 * - Bearer Token
 * - Custom header
 * - Custom cookie
 */
export function setAuth(init, auth) {
    if (auth) {
        switch (auth.type) {
            case "BearerToken": {
                init.headers.Authorization =
                    `Bearer ${auth.token}`;
                break;
            }
            case "ApiKeyHeader": {
                const h = isNonEmptyString(auth.header) ? auth.header : "x-api-key";
                init.headers[h] = auth.value;
                break;
            }
            case "ApiKeyCookie": {
                const h = isNonEmptyString(auth.cookie) ? auth.cookie : "x-api-key";
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