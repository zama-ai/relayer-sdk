import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import {
  assertIsRelayerApiError400NoDetailsType,
  isRelayerApiError400NoDetailsType,
} from './RelayerApiError400NoDetailsType';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiError400NoDetails.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiError400NoDetails.ts

describe('RelayerV2ApiError400NoDetails', () => {
  it('isRelayerV2ApiError400NoDetails', () => {
    expect(
      isRelayerApiError400NoDetailsType({
        label: 'not_ready_for_decryption',
        message: 'hello',
      }),
    ).toBe(true);
    expect(
      isRelayerApiError400NoDetailsType({
        label: 'request_error',
        message: 'hello',
      }),
    ).toBe(true);
    expect(
      isRelayerApiError400NoDetailsType({
        label: 'malformed_json',
        message: 'hello',
      }),
    ).toBe(true);
    expect(isRelayerApiError400NoDetailsType(undefined)).toBe(false);
    expect(isRelayerApiError400NoDetailsType(null)).toBe(false);
    expect(isRelayerApiError400NoDetailsType({})).toBe(false);
    expect(isRelayerApiError400NoDetailsType({ label: 'hello' })).toBe(false);
    expect(isRelayerApiError400NoDetailsType({ label: 'malformed_json' })).toBe(
      false,
    );
    expect(isRelayerApiError400NoDetailsType({ label: 'request_error' })).toBe(
      false,
    );
    expect(
      isRelayerApiError400NoDetailsType({
        label: 'not_ready_for_decryption',
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400NoDetailsType({
        label: 'foo',
        message: 'hello',
      }),
    ).toBe(false);
  });

  it('assertIsRelayerV2ApiError400NoDetails', () => {
    // True
    expect(() =>
      assertIsRelayerApiError400NoDetailsType(
        {
          label: 'malformed_json',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerApiError400NoDetailsType(
        {
          label: 'request_error',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerApiError400NoDetailsType(
        {
          label: 'not_ready_for_decryption',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerApiError400NoDetailsType({}, 'Foo')).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerApiError400NoDetailsType(
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
        type: 'string',
        value: 'foo',
        expectedValue: [
          'malformed_json',
          'request_error',
          'not_ready_for_decryption',
        ],
      }),
    );

    expect(() =>
      assertIsRelayerApiError400NoDetailsType(
        {
          label: 'malformed_json',
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
      assertIsRelayerApiError400NoDetailsType(
        {
          label: 'malformed_json',
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
  });
});
