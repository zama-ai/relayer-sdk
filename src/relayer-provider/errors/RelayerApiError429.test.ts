import { assertIsRelayerApiError429Type } from './RelayerApiError429';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/errors/RelayerV2ApiError429.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/errors/RelayerV2ApiError429.ts

describe('RelayerV2ApiError429', () => {
  it('assertIsRelayerV2ApiError429', () => {
    // True
    expect(() =>
      assertIsRelayerApiError429Type(
        {
          label: 'rate_limited',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerApiError429Type(
        {
          label: 'rate_limited',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerApiError429Type({}, 'Foo')).toThrow();

    expect(() =>
      assertIsRelayerApiError429Type(
        {
          label: 'foo',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerApiError429Type(
        {
          label: 'rate_limited',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerApiError429Type(
        {
          label: 'rate_limited',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow();
  });
});
