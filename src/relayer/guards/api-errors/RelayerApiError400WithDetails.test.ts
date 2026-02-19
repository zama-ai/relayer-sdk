import { InvalidPropertyError } from '@base/errors/InvalidPropertyError';
import {
  assertIsRelayerApiError400WithDetails,
  isRelayerApiError400WithDetails,
} from './RelayerApiError400WithDetails';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer/guards/api-errors/RelayerApiError400WithDetails.test.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2ApiError400WithDetails', () => {
  it('isRelayerV2ApiError400NoDetails', () => {
    expect(
      isRelayerApiError400WithDetails({
        label: 'missing_fields',
        message: 'hello',
        details: [
          {
            field: 'foo',
            issue: 'bar',
          },
        ],
      }),
    ).toBe(true);
    expect(
      isRelayerApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
        details: [
          {
            field: 'foo',
            issue: 'bar',
          },
        ],
      }),
    ).toBe(true);
    expect(isRelayerApiError400WithDetails(undefined)).toBe(false);
    expect(isRelayerApiError400WithDetails(null)).toBe(false);
    expect(isRelayerApiError400WithDetails({})).toBe(false);
    expect(isRelayerApiError400WithDetails({ label: 'hello' })).toBe(false);
    expect(isRelayerApiError400WithDetails({ label: 'missing_fields' })).toBe(
      false,
    );
    expect(
      isRelayerApiError400WithDetails({ label: 'validation_failed' }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
        details: [{}],
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
        details: [{ field: 123 }],
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
        details: [{ field: '123' }],
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
        details: [{ field: '123', issue: 456 }],
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetails({
        label: 'foo',
        message: 'hello',
      }),
    ).toBe(false);
  });

  it('assertIsRelayerV2ApiError400WithDetails', () => {
    // True
    expect(() =>
      assertIsRelayerApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 'hello',
          details: [
            {
              field: 'foo-field',
              issue: 'bar-issue',
            },
          ],
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerApiError400WithDetails(
        {
          label: 'validation_failed',
          message: 'hello',
          details: [
            {
              field: 'foo-field',
              issue: 'bar-issue',
            },
          ],
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerApiError400WithDetails({}, 'Foo', {})).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          property: 'label',
          expectedType: 'string',
          type: 'undefined',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError400WithDetails(
        {
          label: 'foo',
        },
        'Foo',
        {},
      ),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          property: 'label',
          expectedType: 'string',
          expectedValue: ['missing_fields', 'validation_failed'],
          type: 'string',
          value: 'foo',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError400WithDetails(
        {
          label: 'missing_fields',
        },
        'Foo',
        {},
      ),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          property: 'message',
          expectedType: 'string',
          type: 'undefined',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 123,
        },
        'Foo',
        {},
      ),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          property: 'message',
          expectedType: 'string',
          type: 'number',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 'foo',
        },
        'Foo',
        {},
      ),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          property: 'details',
          expectedType: 'Array',
          type: 'undefined',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 'foo',
          details: 'hello',
        },
        'Foo',
        {},
      ),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          property: 'details',
          expectedType: 'Array',
          type: 'string',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 'foo',
          details: [{}],
        },
        'Foo',
        {},
      ),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo.details[0]',
          property: 'field',
          expectedType: 'string',
          type: 'undefined',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 'foo',
          requestId: 'bar',
          details: [{ field: 'hello' }],
        },
        'Foo',
        {},
      ),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo.details[0]',
          property: 'issue',
          expectedType: 'string',
          type: 'undefined',
        },
        {},
      ),
    );
  });
});
