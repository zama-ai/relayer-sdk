import { InvalidPropertyError } from '@base/errors/InvalidPropertyError';
import {
  assertIsRelayerApiError400NoDetails,
  isRelayerApiError400NoDetails,
} from './RelayerApiError400NoDetails';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer/guards/api-errors/RelayerApiError400NoDetails.test.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2ApiError400NoDetails', () => {
  it('isRelayerV2ApiError400NoDetails', () => {
    expect(
      isRelayerApiError400NoDetails({
        label: 'not_ready_for_decryption',
        message: 'hello',
      }),
    ).toBe(true);
    expect(
      isRelayerApiError400NoDetails({
        label: 'request_error',
        message: 'hello',
      }),
    ).toBe(true);
    expect(
      isRelayerApiError400NoDetails({
        label: 'malformed_json',
        message: 'hello',
      }),
    ).toBe(true);
    expect(isRelayerApiError400NoDetails(undefined)).toBe(false);
    expect(isRelayerApiError400NoDetails(null)).toBe(false);
    expect(isRelayerApiError400NoDetails({})).toBe(false);
    expect(isRelayerApiError400NoDetails({ label: 'hello' })).toBe(false);
    expect(isRelayerApiError400NoDetails({ label: 'malformed_json' })).toBe(
      false,
    );
    expect(isRelayerApiError400NoDetails({ label: 'request_error' })).toBe(
      false,
    );
    expect(
      isRelayerApiError400NoDetails({
        label: 'not_ready_for_decryption',
      }),
    ).toBe(false);
    expect(
      isRelayerApiError400NoDetails({
        label: 'foo',
        message: 'hello',
      }),
    ).toBe(false);
  });

  it('assertIsRelayerV2ApiError400NoDetails', () => {
    // True
    expect(() =>
      assertIsRelayerApiError400NoDetails(
        {
          label: 'malformed_json',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerApiError400NoDetails(
        {
          label: 'request_error',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerApiError400NoDetails(
        {
          label: 'not_ready_for_decryption',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerApiError400NoDetails({}, 'Foo', {})).toThrow(
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
      assertIsRelayerApiError400NoDetails(
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
          type: 'string',
          value: 'foo',
          expectedValue: [
            'malformed_json',
            'request_error',
            'not_ready_for_decryption',
          ],
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError400NoDetails(
        {
          label: 'malformed_json',
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
      assertIsRelayerApiError400NoDetails(
        {
          label: 'malformed_json',
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
  });
});
