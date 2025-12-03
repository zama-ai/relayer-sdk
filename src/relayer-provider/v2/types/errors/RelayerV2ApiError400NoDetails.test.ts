import { InvalidPropertyError } from '../../../../errors/InvalidPropertyError';
import {
  assertIsRelayerV2ApiError400NoDetails,
  isRelayerV2ApiError400NoDetails,
} from './RelayerV2ApiError400NoDetails';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiError400NoDetails.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiError400NoDetails.ts

describe('RelayerV2ApiError400NoDetails', () => {
  it('isRelayerV2ApiError400NoDetails', () => {
    expect(
      isRelayerV2ApiError400NoDetails({
        label: 'not_ready_for_decryption',
        message: 'hello',
      }),
    ).toBe(true);
    expect(
      isRelayerV2ApiError400NoDetails({
        label: 'request_error',
        message: 'hello',
      }),
    ).toBe(true);
    expect(
      isRelayerV2ApiError400NoDetails({
        label: 'malformed_json',
        message: 'hello',
      }),
    ).toBe(true);
    expect(isRelayerV2ApiError400NoDetails(undefined)).toBe(false);
    expect(isRelayerV2ApiError400NoDetails(null)).toBe(false);
    expect(isRelayerV2ApiError400NoDetails({})).toBe(false);
    expect(isRelayerV2ApiError400NoDetails({ label: 'hello' })).toBe(false);
    expect(isRelayerV2ApiError400NoDetails({ label: 'malformed_json' })).toBe(
      false,
    );
    expect(isRelayerV2ApiError400NoDetails({ label: 'request_error' })).toBe(
      false,
    );
    expect(
      isRelayerV2ApiError400NoDetails({
        label: 'not_ready_for_decryption',
      }),
    ).toBe(false);
    expect(
      isRelayerV2ApiError400NoDetails({
        label: 'foo',
        message: 'hello',
      }),
    ).toBe(false);
  });

  it('assertIsRelayerV2ApiError400NoDetails', () => {
    // True
    expect(() =>
      assertIsRelayerV2ApiError400NoDetails(
        {
          label: 'malformed_json',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiError400NoDetails(
        {
          label: 'request_error',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ApiError400NoDetails(
        {
          label: 'not_ready_for_decryption',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ApiError400NoDetails({}, 'Foo')).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError400NoDetails(
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
      assertIsRelayerV2ApiError400NoDetails(
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
      assertIsRelayerV2ApiError400NoDetails(
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
