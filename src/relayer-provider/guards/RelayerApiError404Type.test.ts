import { assertIsRelayerApiError404Type } from './RelayerApiError404Type';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/errors/RelayerV2ApiError404.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/errors/RelayerV2ApiError404.ts

describe('RelayerV2ApiError404', () => {
  it('assertIsRelayerV2ApiError404Type', () => {
    // True
    expect(() =>
      assertIsRelayerApiError404Type(
        {
          label: 'not_found',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerApiError404Type(
        {
          label: 'not_found',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerApiError404Type({}, 'Foo')).toThrow();

    expect(() =>
      assertIsRelayerApiError404Type(
        {
          label: 'foo',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerApiError404Type(
        {
          label: 'not_found',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerApiError404Type(
        {
          label: 'not_found',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow();
  });
});
