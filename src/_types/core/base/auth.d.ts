import type { Auth } from "../types/auth.js";
/**
 * Set the authentication method for the request. The default is no authentication.
 * It supports:
 * - Bearer Token
 * - Custom header
 * - Custom cookie
 */
export declare function setAuth(init: RequestInit, auth?: Auth): RequestInit;
//# sourceMappingURL=auth.d.ts.map