import { assertIsRelayerApiError429 } from './RelayerApiError429';

// npx jest --colors --passWithNoTests ./src/relayer/guards/api-errors/RelayerApiError429.test.ts

describe('RelayerV2ApiError429', () => {
  it('assertIsRelayerV2ApiError429', () => {
    // True
    expect(() =>
      assertIsRelayerApiError429(
        {
          label: 'rate_limited',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerApiError429(
        {
          label: 'rate_limited',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerApiError429({}, 'Foo', {})).toThrow();

    expect(() =>
      assertIsRelayerApiError429(
        {
          label: 'foo',
        },
        'Foo',
        {},
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerApiError429(
        {
          label: 'rate_limited',
        },
        'Foo',
        {},
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerApiError429(
        {
          label: 'rate_limited',
          message: 123,
        },
        'Foo',
        {},
      ),
    ).toThrow();
  });
});
