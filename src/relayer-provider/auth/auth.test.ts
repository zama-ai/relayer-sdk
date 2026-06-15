import { setAuth } from './auth';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/auth/auth.test.ts --collectCoverageFrom=./src/relayer-provider/auth/auth.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/auth/auth.test.ts --collectCoverageFrom=./src/relayer-provider/auth/auth.ts

describe('auth', () => {
  it('setAuth ApiKeyHeader', () => {
    const payload = {
      foo: 'bar',
    };
    const init = setAuth(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      } satisfies RequestInit,
      {
        __type: 'ApiKeyHeader',
        header: 'hello',
        value: 'world',
      },
    );

    expect(init).toEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        hello: 'world',
      },
      body: '{"foo":"bar"}',
    });
  });

  it('setAuth ApiKeyHeader no header', () => {
    const payload = {
      foo: 'bar',
    };
    const init = setAuth(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      } satisfies RequestInit,
      {
        __type: 'ApiKeyHeader',
        value: 'world',
      },
    );

    expect(init).toEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'world',
      },
      body: '{"foo":"bar"}',
    });
  });

  // GET request tests
  it('setAuth GET ApiKeyHeader', () => {
    const init = setAuth(
      {
        method: 'GET',
        headers: {
          'ZAMA-SDK-VERSION': '1.0.0',
        },
      } satisfies RequestInit,
      {
        __type: 'ApiKeyHeader',
        header: 'x-custom-api-key',
        value: 'secret-key',
      },
    );

    expect(init).toEqual({
      method: 'GET',
      headers: {
        'ZAMA-SDK-VERSION': '1.0.0',
        'x-custom-api-key': 'secret-key',
      },
    });
  });

  it('setAuth GET ApiKeyHeader default header', () => {
    const init = setAuth(
      {
        method: 'GET',
        headers: {
          'ZAMA-SDK-VERSION': '1.0.0',
        },
      } satisfies RequestInit,
      {
        __type: 'ApiKeyHeader',
        value: 'secret-key',
      },
    );

    expect(init).toEqual({
      method: 'GET',
      headers: {
        'ZAMA-SDK-VERSION': '1.0.0',
        'x-api-key': 'secret-key',
      },
    });
  });

  it('setAuth GET no auth', () => {
    const init = setAuth(
      {
        method: 'GET',
        headers: {
          'ZAMA-SDK-VERSION': '1.0.0',
        },
      } satisfies RequestInit,
      undefined,
    );

    expect(init).toEqual({
      method: 'GET',
      headers: {
        'ZAMA-SDK-VERSION': '1.0.0',
      },
    });
  });
});
