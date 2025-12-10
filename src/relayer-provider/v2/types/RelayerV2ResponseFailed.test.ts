import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
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
      requestId: 'world',
    };

    // True
    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, label: 'malformed_json' },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, label: 'request_error' },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, label: 'not_ready_for_decryption' },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, label: 'missing_fields', details: [] },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, label: 'validation_failed', details: [] },
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
            label: 'rate_limited',
            retryAfterSeconds: 'Thu, 14 Nov 2024 15:30:00 GMT',
          },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { ...err, label: 'internal_server_error' },
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
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'status',
        expectedType: 'string',
        type: 'string',
        expectedValue: 'failed',
        value: 'fail',
      }),
    );

    expect(() => assertIsRelayerV2ResponseFailed({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'status',
        expectedType: 'string',
        expectedValue: 'failed',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
        },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'error',
        expectedType: 'non-nullable',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: {},
        },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo.error',
        property: 'label',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResponseFailed(
        {
          status: 'failed',
          error: { label: 'hello' },
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.error',
        property: 'label',
        expectedType: 'string',
        type: 'string',
        expectedValue: [
          'malformed_json',
          'request_error',
          'not_ready_for_decryption',
          'missing_fields',
          'validation_failed',
          'rate_limited',
          'internal_server_error',
        ],
        value: 'hello',
      }),
    );
  });
});
