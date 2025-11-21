import { assertIsRelayerV2ApiError400WithDetails } from './RelayerV2ApiError400WithDetails';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiError400WithDetails.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiError400WithDetails.ts

describe('RelayerV2ApiError400WithDetails', () => {
  it('assertIsRelayerV2ApiError400WithDetails', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'missing_fields',
          message: 'hello',
          request_id: 'world',
          details: [
            {
              field: 'foo-field',
              issue: 'bar-issue',
            },
          ],
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'validation_failed',
          message: 'hello',
          request_id: 'world',
          details: [
            {
              field: 'foo-field',
              issue: 'bar-issue',
            },
          ],
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiError400WithDetails({}, 'Foo')).toThrow(
      'Invalid Foo.code',
    );
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'foo',
        },
        'Foo',
      ),
    ).toThrow(
      "Invalid value for Foo.code. Expected 'missing_fields' | 'validation_failed'. Got 'foo'.",
    );

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'missing_fields',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.message');
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'missing_fields',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.message');
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'missing_fields',
          message: 'foo',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.request_id');
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'missing_fields',
          message: 'foo',
          request_id: 123,
        },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.request_id');
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'missing_fields',
          message: 'foo',
          request_id: 'bar',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.details');
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'missing_fields',
          message: 'foo',
          request_id: 'bar',
          details: 'hello',
        },
        'Foo',
      ),
    ).toThrow('Invalid array Foo.details');
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'missing_fields',
          message: 'foo',
          request_id: 'bar',
          details: [{}],
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.details[0].field');
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          code: 'missing_fields',
          message: 'foo',
          request_id: 'bar',
          details: [{ field: 'hello' }],
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.details[0].issue');
  });
});
