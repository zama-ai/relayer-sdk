import { assertIsRelayerV2ApiError400 } from './RelayerV2ApiError400';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiError400.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiError400.ts

describe('RelayerV2ApiError400', () => {
  it('assertIsRelayerV2ApiError400', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiError400(
        {
          code: 'malformed_json',
          message: 'hello',
          request_id: 'world',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiError400(
        {
          code: 'request_error',
          message: 'hello',
          request_id: 'world',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiError400(
        {
          code: 'not_ready_for_decryption',
          message: 'hello',
          request_id: 'world',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiError400({}, 'Foo')).toThrow(
      'Invalid Foo.code',
    );
    expect(() =>
      assertIsRelayerV2ApiError400(
        {
          code: 'foo',
        },
        'Foo',
      ),
    ).toThrow(
      "Invalid value for Foo.code. Expected 'malformed_json' | 'request_error' | 'not_ready_for_decryption'. Got 'foo'.",
    );

    expect(() =>
      assertIsRelayerV2ApiError400(
        {
          code: 'malformed_json',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.message');
    expect(() =>
      assertIsRelayerV2ApiError400(
        {
          code: 'malformed_json',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.message');
    expect(() =>
      assertIsRelayerV2ApiError400(
        {
          code: 'malformed_json',
          message: 'foo',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.request_id');
    expect(() =>
      assertIsRelayerV2ApiError400(
        {
          code: 'malformed_json',
          message: 'foo',
          request_id: 123,
        },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.request_id');
  });
});
