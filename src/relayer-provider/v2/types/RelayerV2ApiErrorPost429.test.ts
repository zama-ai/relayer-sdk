import { assertIsRelayerV2ApiPostError429 } from './RelayerV2ApiErrorPost429';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiErrorPost429.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiErrorPost429.ts

describe('RelayerV2ApiPostError429', () => {
  it('assertIsRelayerV2ApiPostError429', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          code: 'rate_limited',
          message: 'hello',
          retry_after: 'Thu, 14 Nov 2024 15:30:00 GMT',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          code: 'rate_limited',
          message: 'hello',
          retry_after: 'Thu, 14 Nov 2024 15:30:00 GMT',
          request_id: 'foo',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiPostError429({}, 'Foo')).toThrow(
      'Invalid Foo.code',
    );
    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          code: 'foo',
        },
        'Foo',
      ),
    ).toThrow(
      "Invalid value for Foo.code. Expected 'rate_limited'. Got 'foo'.",
    );
    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          code: 'rate_limited',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.message');
    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          code: 'rate_limited',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.message');
    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          code: 'rate_limited',
          message: 'foo',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.retry_after');
    expect(() =>
      assertIsRelayerV2ApiPostError429(
        {
          code: 'rate_limited',
          message: 'foo',
          retry_after: 'bar',
        },
        'Foo',
      ),
    ).toThrow('Invalid timestamp Foo.retry_after');
  });
});
