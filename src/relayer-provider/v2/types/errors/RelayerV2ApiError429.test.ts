import { assertIsRelayerV2ApiError429 } from './RelayerV2ApiError429';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/errors/RelayerV2ApiError429.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/errors/RelayerV2ApiError429.ts

describe('RelayerV2ApiError429', () => {
  it('assertIsRelayerV2ApiError429', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiError429(
        {
          label: 'rate_limited',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiError429(
        {
          label: 'rate_limited',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiError429({}, 'Foo')).toThrow();

    expect(() =>
      assertIsRelayerV2ApiError429(
        {
          label: 'foo',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerV2ApiError429(
        {
          label: 'rate_limited',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerV2ApiError429(
        {
          label: 'rate_limited',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow();
  });
});
