import { assertIsRelayerV2ApiError404 } from './RelayerV2ApiError404';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/errors/RelayerV2ApiError404.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/errors/RelayerV2ApiError404.ts

describe('RelayerV2ApiError404', () => {
  it('assertIsRelayerV2ApiError404', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiError404(
        {
          label: 'not_found',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiError404(
        {
          label: 'not_found',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiError404({}, 'Foo')).toThrow();

    expect(() =>
      assertIsRelayerV2ApiError404(
        {
          label: 'foo',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerV2ApiError404(
        {
          label: 'not_found',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerV2ApiError404(
        {
          label: 'not_found',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow();
  });
});
