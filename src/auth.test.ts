import { setAuth } from './auth';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests --coverage ./src/auth.test.ts --collectCoverageFrom=./src/auth.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/auth.test.ts --collectCoverageFrom=./src/auth.ts

describe('auth', () => {
  it('setAuth BearerToken', () => {
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
        __type: 'BearerToken',
        token: 'hello',
      },
    );

    expect(init).toEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer hello',
      },
      body: '{"foo":"bar"}',
    });
  });

  it('setAuth ApiKeyCookie', () => {
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
        __type: 'ApiKeyCookie',
        cookie: 'hello',
        value: 'world',
      },
    );

    expect(init).toEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'hello=world;',
      },
      body: '{"foo":"bar"}',
    });
  });

  it('setAuth ApiKeyCookie no cookie', () => {
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
        __type: 'ApiKeyCookie',
        value: 'world',
      },
    );

    expect(init).toEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'x-api-key=world;',
      },
      body: '{"foo":"bar"}',
    });
  });

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
});
