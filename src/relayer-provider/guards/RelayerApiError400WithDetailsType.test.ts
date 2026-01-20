import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import {
  assertIsRelayerApiError400WithDetailsType,
  isRelayerApiError400WithDetailsType,
} from './RelayerApiError400WithDetailsType';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiError400WithDetails.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiError400WithDetails.ts

describe('RelayerV2ApiError400WithDetails', () => {
  it('isRelayerV2ApiError400NoDetails', () => {
    expect(
      isRelayerApiError400WithDetailsType({
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
      isRelayerApiError400WithDetailsType({
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
    expect(isRelayerApiError400WithDetailsType(undefined)).toBe(false);
    expect(isRelayerApiError400WithDetailsType(null)).toBe(false);
    expect(isRelayerApiError400WithDetailsType({})).toBe(false);
    expect(isRelayerApiError400WithDetailsType({ label: 'hello' })).toBe(false);
    expect(
      isRelayerApiError400WithDetailsType({ label: 'missing_fields' }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetailsType({ label: 'validation_failed' }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetailsType({
        label: 'validation_failed',
        message: 'hello',
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetailsType({
        label: 'validation_failed',
        message: 'hello',
        details: [{}],
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetailsType({
        label: 'validation_failed',
        message: 'hello',
        details: [{ field: 123 }],
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetailsType({
        label: 'validation_failed',
        message: 'hello',
        details: [{ field: '123' }],
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetailsType({
        label: 'validation_failed',
        message: 'hello',
        details: [{ field: '123', issue: 456 }],
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400WithDetailsType({
        label: 'foo',
        message: 'hello',
      }),
    ).toBe(false);
  });

  it('assertIsRelayerV2ApiError400WithDetails', () => {
    // True
    expect(() =>
      assertIsRelayerApiError400WithDetailsType(
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
      assertIsRelayerApiError400WithDetailsType(
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
    expect(() => assertIsRelayerApiError400WithDetailsType({}, 'Foo')).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerApiError400WithDetailsType(
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
      assertIsRelayerApiError400WithDetailsType(
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
      assertIsRelayerApiError400WithDetailsType(
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
      assertIsRelayerApiError400WithDetailsType(
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
      assertIsRelayerApiError400WithDetailsType(
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
      assertIsRelayerApiError400WithDetailsType(
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
      assertIsRelayerApiError400WithDetailsType(
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
