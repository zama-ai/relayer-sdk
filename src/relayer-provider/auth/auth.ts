import { isNonEmptyString } from '@base/string';
import type { Auth } from '../types/public-api';

/**
 * Set the authentication method for the request. The default is no authentication.
 * It supports:
 * - API key header (default `x-api-key`)
 */
export function setAuth(init: RequestInit, auth?: Auth): RequestInit {
  if (auth) {
    const header = isNonEmptyString(auth.header) ? auth.header : 'x-api-key';
    (init.headers as Record<string, string>)[header] = auth.value;
  }
  return init;
}
