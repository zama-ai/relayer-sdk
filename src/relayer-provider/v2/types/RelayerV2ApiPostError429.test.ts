import { assertIsRelayerV2ApiPostError429 } from './RelayerV2ApiPostError429';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiPostError429.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiPostError429.ts

describe('RelayerV2ApiPostError429', () => {
  it('assertIsRelayerV2ApiPostError429', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          label: 'rate_limited',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          label: 'rate_limited',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiPostError429({}, 'Foo')).toThrow();

    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          label: 'foo',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          label: 'rate_limited',
        },
        'Foo',
      ),
    ).toThrow();

    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          label: 'rate_limited',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow();
  });
});
