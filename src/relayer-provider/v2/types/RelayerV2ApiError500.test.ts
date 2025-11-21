import { assertIsRelayerV2ApiError500 } from './RelayerV2ApiError500';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiError500.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiError500.ts

describe('RelayerV2ApiError500', () => {
  it('assertIsRelayerV2ApiError500', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiError500(
        {
          code: 'internal_server_error',
          message: 'hello',
          request_id: 'world',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiError500({}, 'Foo')).toThrow(
      'Invalid Foo.code',
    );
    expect(() =>
      assertIsRelayerV2ApiError500(
        {
          code: 'foo',
        },
        'Foo',
      ),
    ).toThrow(
      "Invalid value for Foo.code. Expected 'internal_server_error'. Got 'foo'.",
    );
    expect(() =>
      assertIsRelayerV2ApiError500(
        {
          code: 'internal_server_error',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.message');
    expect(() =>
      assertIsRelayerV2ApiError500(
        {
          code: 'internal_server_error',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.message');
    expect(() =>
      assertIsRelayerV2ApiError500(
        {
          code: 'internal_server_error',
          message: 'foo',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.request_id');
    expect(() =>
      assertIsRelayerV2ApiError500(
        {
          code: 'internal_server_error',
          message: 'foo',
          request_id: 123,
        },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.request_id');
  });
});
