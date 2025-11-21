import { assertIsRelayerV2GetResponseKeyUrl } from './RelayerV2GetResponseKeyUrl';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2GetResponseKeyUrl.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2GetResponseKeyUrl.ts

describe('RelayerV2GetResponseKeyUrl', () => {
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

    expect(() => assertIsRelayerV2GetResponseKeyUrl({}, 'Foo')).toThrow(
      'Invalid Foo.response',
    );
    expect(() => assertIsRelayerV2GetResponseKeyUrl({}, 'Foo')).toThrow(
      'Invalid Foo.response',
    );
    expect(() =>
      assertIsRelayerV2GetResponseKeyUrl(
        {
          response: {},
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.response.crs');
    expect(() =>
      assertIsRelayerV2GetResponseKeyUrl(
        {
          response: {
            crs: {},
          },
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.response.fhe_key_info');
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
    ).toThrow('Invalid array Foo.response.fhe_key_info');
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
    ).toThrow('Invalid Foo.response.fhe_key_info[0]');
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
    ).toThrow('Invalid Foo.response.fhe_key_info[0].fhe_public_key');
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
    ).toThrow('Invalid Foo.response.fhe_key_info[0].fhe_public_key.data_id');
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
    ).toThrow(
      'Invalid string Foo.response.fhe_key_info[0].fhe_public_key.data_id',
    );
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
    ).toThrow('Invalid Foo.response.fhe_key_info[0].fhe_public_key.urls');
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
    ).toThrow('Invalid array Foo.response.fhe_key_info[0].fhe_public_key.urls');
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
    ).toThrow(
      'Invalid string Foo.response.fhe_key_info[0].fhe_public_key.urls[0]',
    );
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
    ).toThrow('Invalid Foo.response.crs.foo.data_id');
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
    ).toThrow('Invalid string Foo.response.crs.foo.data_id');
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
    ).toThrow('Invalid Foo.response.crs.foo.urls');
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
    ).toThrow('Invalid array Foo.response.crs.foo.urls');
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
  });
});
