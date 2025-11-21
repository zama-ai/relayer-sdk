import { assertIsRelayerV2ResponseFailed } from './RelayerV2ResponseFailed';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResponseFailed.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResponseFailed.ts

/*
  type RelayerV2ResponseFailed = {
    status: "failed";
    error: RelayerV2ApiError;
  }
*/
describe('RelayerV2ResponseFailed', () => {
  it('assertIsRelayerV2ResponseFailed', () => {
    const err = {
      code: 'request_error',
      message: 'hello',
      request_id: 'world',
    };
    // True
    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, code: 'malformed_json' },
        },
        'Foo',
      ),
    ).not.toThrow();
    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, code: 'request_error' },
        },
        'Foo',
      ),
    ).not.toThrow();
    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, code: 'not_ready_for_decryption' },
        },
        'Foo',
      ),
    ).not.toThrow();
    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, code: 'missing_fields', details: [] },
        },
        'Foo',
      ),
    ).not.toThrow();
    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, code: 'validation_failed', details: [] },
        },
        'Foo',
      ),
    ).not.toThrow();
    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: {
            ...err,
            code: 'rate_limited',
            retry_after: 'Thu, 14 Nov 2024 15:30:00 GMT',
          },
        },
        'Foo',
      ),
    ).not.toThrow();
    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, code: 'internal_server_error' },
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'fail',
        },
        'Foo',
      ),
    ).toThrow("Invalid value for Foo.status. Expected 'failed'. Got 'fail'.");

    expect(() => assertIsRelayerV2ResponseFailed({}, 'Foo')).toThrow(
      'Invalid Foo.status',
    );

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.error');

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: {},
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.error.code');

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { code: 'hello' },
        },
        'Foo',
      ),
    ).toThrow("Invalid Foo.error.error.code='hello'.");
  });
});
