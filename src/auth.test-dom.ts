/**
 * @jest-environment jsdom
 */

import { setAuth } from './auth';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests --coverage --config jest.dom.config.cjs ./src/auth.test-dom.ts --collectCoverageFrom=./src/auth.ts --testNamePattern=BBB
// npx jest --colors --passWithNoTests --coverage --config jest.dom.config.cjs ./src/auth.test-dom.ts --collectCoverageFrom=./src/auth.ts

describe('auth.dom', () => {
  let cookieSpy: jest.SpyInstance;

  beforeEach(() => {
    cookieSpy = jest.spyOn(document, 'cookie', 'set');
  });

  afterEach(() => {
    cookieSpy.mockRestore();
  });

  it('setAuth ApiKeyCookie', () => {
    expect(typeof window).not.toBe('undefined');
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
      },
      body: '{"foo":"bar"}',
      credentials: 'include',
    });

    expect(cookieSpy).toHaveBeenCalledWith(
      'hello=world; path=/; SameSite=Lax; Secure; HttpOnly;',
    );
  });

  it('setAuth ApiKeyCookie no cookie', () => {
    expect(typeof window).not.toBe('undefined');
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
      },
      body: '{"foo":"bar"}',
      credentials: 'include',
    });

    expect(cookieSpy).toHaveBeenCalledWith(
      'x-api-key=world; path=/; SameSite=Lax; Secure; HttpOnly;',
    );
  });
});
