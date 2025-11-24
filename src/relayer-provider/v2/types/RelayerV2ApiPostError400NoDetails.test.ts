import { assertIsRelayerV2ApiPostError400NoDetails } from './RelayerV2ApiPostError400NoDetails';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiError400.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiError400.ts

describe('RelayerV2ApiError400', () => {
  it('assertIsRelayerV2ApiError400', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiPostError400NoDetails(
        {
          code: 'malformed_json',
          message: 'hello',
          request_id: 'world',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiPostError400NoDetails(
        {
          code: 'request_error',
          message: 'hello',
          request_id: 'world',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiPostError400NoDetails(
        {
          code: 'not_ready_for_decryption',
          message: 'hello',
          request_id: 'world',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiPostError400NoDetails({}, 'Foo')).toThrow(
      'Invalid Foo.code',
    );
    expect(() =>
      assertIsRelayerV2ApiPostError400NoDetails(
        {
          code: 'foo',
        },
        'Foo',
      ),
    ).toThrow(
      "Invalid value for Foo.code. Expected 'malformed_json' | 'request_error' | 'not_ready_for_decryption'. Got 'foo'.",
    );

    expect(() =>
      assertIsRelayerV2ApiPostError400NoDetails(
        {
          code: 'malformed_json',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.message');
    expect(() =>
      assertIsRelayerV2ApiPostError400NoDetails(
        {
          code: 'malformed_json',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.message');
    expect(() =>
      assertIsRelayerV2ApiPostError400NoDetails(
        {
          code: 'malformed_json',
          message: 'foo',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.request_id');
    expect(() =>
      assertIsRelayerV2ApiPostError400NoDetails(
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
