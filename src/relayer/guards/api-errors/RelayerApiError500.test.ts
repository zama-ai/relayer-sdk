import {
  InvalidPropertyError,
  missingPropertyError,
} from '@base/errors/InvalidPropertyError';
import { assertIsRelayerApiError500 } from './RelayerApiError500';

// npx jest --colors --passWithNoTests --coverage ./src/relayer/guards/api-errors/RelayerApiError500.test.ts

describe('RelayerV2ApiError500', () => {
  it('assertIsRelayerV2ApiError500', () => {
    // Success
    expect(() =>
      assertIsRelayerApiError500(
        {
          label: 'internal_server_error',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerApiError500({}, 'Foo', {})).toThrow(
      missingPropertyError(
        {
          subject: 'Foo',
          property: 'label',
          expectedType: 'string',
          expectedValue: 'internal_server_error',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError500(
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
          expectedValue: 'internal_server_error',
          value: 'foo',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError500(
        {
          label: 'internal_server_error',
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
      assertIsRelayerApiError500(
        {
          label: 'internal_server_error',
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
