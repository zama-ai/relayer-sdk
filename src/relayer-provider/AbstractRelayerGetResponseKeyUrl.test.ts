import {
  assertIsRelayerGetResponseKeyUrlCamelCase,
  isRelayerGetResponseKeyUrlCamelCase,
} from './AbstractRelayerGetResponseKeyUrl';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2GetResponseKeyUrl.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2GetResponseKeyUrl.ts

describe('RelayerV2GetResponseKeyUrl', () => {
  it('isRelayerV2GetResponseKeyUrl', () => {
    expect(
      isRelayerGetResponseKeyUrlCamelCase({
        response: {
          fheKeyInfo: [
            {
              fhePublicKey: { dataId: 'hello', urls: ['world'] },
            },
          ],
          crs: {
            foo: { dataId: 'hello', urls: ['world'] },
          },
        },
      }),
    ).toBe(true);

    expect(isRelayerGetResponseKeyUrlCamelCase({})).toBe(false);
  });

  it('assertIsRelayerV2GetResponseKeyUrl', () => {
    // True
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            fheKeyInfo: [
              {
                fhePublicKey: { dataId: 'hello', urls: ['world'] },
              },
            ],
            crs: {
              foo: { dataId: 'hello', urls: ['world'] },
            },
          },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {
              foo: {
                dataId: 'hello',
                urls: ['world'],
              },
            },
            fheKeyInfo: [
              {
                fhePublicKey: {
                  dataId: 'hello',
                  urls: ['world'],
                },
              },
            ],
          },
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase({}, 'Foo'),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase({}, 'Foo'),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {},
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {},
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {},
            fheKeyInfo: {},
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {},
            fheKeyInfo: ['hello'],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {},
            fheKeyInfo: [{}],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {},
            fheKeyInfo: [
              {
                fhePublicKey: {},
              },
            ],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {},
            fheKeyInfo: [
              {
                fhePublicKey: {
                  dataId: 123,
                },
              },
            ],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {},
            fheKeyInfo: [
              {
                fhePublicKey: {
                  dataId: 'hello',
                },
              },
            ],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {},
            fheKeyInfo: [
              {
                fhePublicKey: {
                  dataId: 'hello',
                  urls: {},
                },
              },
            ],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {},
            fheKeyInfo: [
              {
                fhePublicKey: {
                  dataId: 'hello',
                  urls: [123],
                },
              },
            ],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {
              foo: '123',
            },
            fheKeyInfo: [
              {
                fhePublicKey: {
                  dataId: 'hello',
                  urls: ['world'],
                },
              },
            ],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {
              foo: {
                dataId: 234,
              },
            },
            fheKeyInfo: [
              {
                fhePublicKey: {
                  dataId: 'hello',
                  urls: ['world'],
                },
              },
            ],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {
              foo: {
                dataId: '234',
              },
            },
            fheKeyInfo: [
              {
                fhePublicKey: {
                  dataId: 'hello',
                  urls: ['world'],
                },
              },
            ],
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerGetResponseKeyUrlCamelCase(
        {
          response: {
            crs: {
              foo: {
                dataId: 'hello',
                urls: 'world',
              },
            },
            fheKeyInfo: [
              {
                fhePublicKey: {
                  dataId: 'hello',
                  urls: ['world'],
                },
              },
            ],
          },
        },
        'Foo',
      ),
    ).toThrow();
  });
});
