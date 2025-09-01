type BearerToken = {
  __type: 'BearerToken';
  token: string;
};

type ApiKeyHeader = {
  __type: 'ApiKeyHeader';
  header?: string;
  value: string;
};

type ApiKeyCookie = {
  __type: 'ApiKeyCookie';
  cookie?: string;
  value: string;
};

export type Auth = BearerToken | ApiKeyHeader | ApiKeyCookie;
export function setAuth(init: RequestInit, auth?: Auth): RequestInit {
  if (auth) {
    switch (auth.__type) {
      case 'BearerToken':
        (init.headers as Record<string, string>)[
          'Authorization'
        ] = `Bearer ${auth.token}`;
        break;

      case 'ApiKeyHeader':
        (init.headers as Record<string, string>)[auth.header || 'x-api-key'] =
          auth.value;
        break;

      case 'ApiKeyCookie':
        if (typeof window !== 'undefined') {
          document.cookie = `${auth.cookie || 'x-api-key'}=${
            auth.value
          }; path=/; SameSite=Lax; Secure;`;
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
