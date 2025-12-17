import {
  assertIsRelayerV2GetResponseKeyUrl,
  isRelayerV2GetResponseKeyUrl,
} from './RelayerV2GetResponseKeyUrl';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2GetResponseKeyUrl.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2GetResponseKeyUrl.ts

describe('RelayerV2GetResponseKeyUrl', () => {
  it('isRelayerV2GetResponseKeyUrl', () => {
    expect(
      isRelayerV2GetResponseKeyUrl({
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

    expect(isRelayerV2GetResponseKeyUrl({})).toBe(false);
  });

  it('assertIsRelayerV2GetResponseKeyUrl', () => {
    // True
    expect(() =>
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
    expect(() => assertIsRelayerV2GetResponseKeyUrl({}, 'Foo')).toThrow();
    expect(() => assertIsRelayerV2GetResponseKeyUrl({}, 'Foo')).toThrow();
    expect(() =>
      assertIsRelayerV2GetResponseKeyUrl(
        {
          response: {},
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerV2GetResponseKeyUrl(
        {
          response: {
            crs: {},
          },
        },
        'Foo',
      ),
    ).toThrow();
    expect(() =>
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
      assertIsRelayerV2GetResponseKeyUrl(
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
