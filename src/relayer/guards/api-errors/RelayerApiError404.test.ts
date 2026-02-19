import { assertIsRelayerApiError404 } from './RelayerApiError404';

// npx jest --colors --passWithNoTests ./src/relayer/guards/api-errors/RelayerApiError404.test.ts

describe('RelayerV2ApiError404', () => {
  it('assertIsRelayerV2ApiError404Type', () => {
    // True
    expect(() =>
      assertIsRelayerApiError404(
        {
          label: 'not_found',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerApiError404(
        {
          label: 'not_found',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerApiError404({}, 'Foo', {})).toThrow();

    expect(() =>
      assertIsRelayerApiError404(
        {
          label: 'foo',
        },
        'Foo',
        {},
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerApiError404(
        {
          label: 'not_found',
        },
        'Foo',
        {},
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerApiError404(
        {
          label: 'not_found',
          message: 123,
        },
        'Foo',
        {},
      ),
    ).toThrow();
  });
});
