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
          fhe_key_info: [
            {
              fhe_public_key: { data_id: 'hello', urls: ['world'] },
            },
          ],
          crs: {
            foo: { data_id: 'hello', urls: ['world'] },
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
            fhe_key_info: [
              {
                fhe_public_key: { data_id: 'hello', urls: ['world'] },
              },
            ],
            crs: {
              foo: { data_id: 'hello', urls: ['world'] },
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
                data_id: 'hello',
                urls: ['world'],
              },
            },
            fhe_key_info: [
              {
                fhe_public_key: {
                  data_id: 'hello',
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
            fhe_key_info: {},
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
            fhe_key_info: ['hello'],
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
            fhe_key_info: [{}],
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
            fhe_key_info: [
              {
                fhe_public_key: {},
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
            fhe_key_info: [
              {
                fhe_public_key: {
                  data_id: 123,
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
            fhe_key_info: [
              {
                fhe_public_key: {
                  data_id: 'hello',
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
            fhe_key_info: [
              {
                fhe_public_key: {
                  data_id: 'hello',
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
            fhe_key_info: [
              {
                fhe_public_key: {
                  data_id: 'hello',
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
            fhe_key_info: [
              {
                fhe_public_key: {
                  data_id: 'hello',
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
                data_id: 234,
              },
            },
            fhe_key_info: [
              {
                fhe_public_key: {
                  data_id: 'hello',
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
                data_id: '234',
              },
            },
            fhe_key_info: [
              {
                fhe_public_key: {
                  data_id: 'hello',
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
                data_id: 'hello',
                urls: 'world',
              },
            },
            fhe_key_info: [
              {
                fhe_public_key: {
                  data_id: 'hello',
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
