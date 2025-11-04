/**
 * Bearer Token Authentication
 */
export type BearerToken = {
  __type: 'BearerToken';
  /**
   * The Bearer token.
   */
  token: string;
};

/**
 * Custom header authentication
 */
export type ApiKeyHeader = {
  __type: 'ApiKeyHeader';
  /**
   * The header name. The default value is `x-api-key`.
   */
  header?: string;
  /**
   * The API key.
   */
  value: string;
};

/**
 * Custom cookie authentication
 */
export type ApiKeyCookie = {
  __type: 'ApiKeyCookie';
  /**
   * The cookie name. The default value is `x-api-key`.
   */
  cookie?: string;
  /**
   * The API key.
   */
  value: string;
};

/**
 * Set the authentication method for the request. The default is no authentication.
 * It supports:
 * - Bearer Token
 * - Custom header
 * - Custom cookie
 */
export type Auth = BearerToken | ApiKeyHeader | ApiKeyCookie;
export function setAuth(init: RequestInit, auth?: Auth): RequestInit {
  if (auth) {
    switch (auth.__type) {
      case 'BearerToken':
        (init.headers as Record<string, string>)['Authorization'] =
          `Bearer ${auth.token}`;
        break;

      case 'ApiKeyHeader':
        (init.headers as Record<string, string>)[auth.header || 'x-api-key'] =
          auth.value;
        break;

      case 'ApiKeyCookie':
        if (typeof window !== 'undefined') {
          document.cookie = `${auth.cookie || 'x-api-key'}=${
            auth.value
          }; path=/; SameSite=Lax; Secure; HttpOnly;`;
          init.credentials = 'include';
        } else {
          let cookie = `${auth.cookie || 'x-api-key'}=${auth.value};`;
          (init.headers as Record<string, string>)['Cookie'] = cookie;
        }
        break;
    }
  }
  return init;
}
