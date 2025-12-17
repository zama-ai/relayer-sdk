import { InvalidPropertyError } from '../../../../errors/InvalidPropertyError';
import {
  assertIsRelayerV2ApiError400WithDetails,
  isRelayerV2ApiError400WithDetails,
} from './RelayerV2ApiError400WithDetails';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiError400WithDetails.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiError400WithDetails.ts

describe('RelayerV2ApiError400WithDetails', () => {
  it('isRelayerV2ApiError400NoDetails', () => {
    expect(
      isRelayerV2ApiError400WithDetails({
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
      isRelayerV2ApiError400WithDetails({
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
    expect(isRelayerV2ApiError400WithDetails(undefined)).toBe(false);
    expect(isRelayerV2ApiError400WithDetails(null)).toBe(false);
    expect(isRelayerV2ApiError400WithDetails({})).toBe(false);
    expect(isRelayerV2ApiError400WithDetails({ label: 'hello' })).toBe(false);
    expect(isRelayerV2ApiError400WithDetails({ label: 'missing_fields' })).toBe(
      false,
    );
    expect(
      isRelayerV2ApiError400WithDetails({ label: 'validation_failed' }),
    ).toBe(false);
    expect(
      isRelayerV2ApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
      }),
    ).toBe(false);
    expect(
      isRelayerV2ApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
        details: [{}],
      }),
    ).toBe(false);
    expect(
      isRelayerV2ApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
        details: [{ field: 123 }],
      }),
    ).toBe(false);
    expect(
      isRelayerV2ApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
        details: [{ field: '123' }],
      }),
    ).toBe(false);
    expect(
      isRelayerV2ApiError400WithDetails({
        label: 'validation_failed',
        message: 'hello',
        details: [{ field: '123', issue: 456 }],
      }),
    ).toBe(false);
    expect(
      isRelayerV2ApiError400WithDetails({
        label: 'foo',
        message: 'hello',
      }),
    ).toBe(false);
  });

  it('assertIsRelayerV2ApiError400WithDetails', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
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
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
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
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiError400WithDetails({}, 'Foo')).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          label: 'foo',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        expectedValue: ['missing_fields', 'validation_failed'],
        type: 'string',
        value: 'foo',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          label: 'missing_fields',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'message',
        expectedType: 'string',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 123,
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'message',
        expectedType: 'string',
        type: 'number',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 'foo',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'details',
        expectedType: 'Array',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 'foo',
          details: 'hello',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'details',
        expectedType: 'Array',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 'foo',
          details: [{}],
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.details[0]',
        property: 'field',
        expectedType: 'string',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError400WithDetails(
        {
          label: 'missing_fields',
          message: 'foo',
          requestId: 'bar',
          details: [{ field: 'hello' }],
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.details[0]',
        property: 'issue',
        expectedType: 'string',
        type: 'undefined',
      }),
    );
  });
});
