import {
  InvalidPropertyError,
  missingPropertyError,
} from '@base/errors/InvalidPropertyError';
import { assertIsRelayerApiError503 } from './RelayerApiError503';

// npx jest --colors --passWithNoTests ./src/relayer/guards/api-errors/RelayerApiError503.test.ts

describe('RelayerV2ApiError503', () => {
  it('assertIsRelayerV2ApiError503', () => {
    // Success
    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'protocol_paused',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'gateway_not_reachable',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerApiError503({}, 'Foo', {})).toThrow(
      missingPropertyError(
        {
          subject: 'Foo',
          property: 'label',
          expectedType: 'string',
          expectedValue: [
            'protocol_paused',
            'gateway_not_reachable',
            'readiness_check_timedout',
            'response_timedout',
          ],
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError503(
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
          expectedValue: [
            'readiness_check_timedout',
            'response_timedout',
            'protocol_paused',
            'gateway_not_reachable',
          ],
          value: 'foo',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'protocol_paused',
        },
        'Foo',
        {},
      ),
    ).toThrow(
      missingPropertyError(
        {
          subject: 'Foo',
          property: 'message',
          expectedType: 'string',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'gateway_not_reachable',
        },
        'Foo',
        {},
      ),
    ).toThrow(
      missingPropertyError(
        {
          subject: 'Foo',
          property: 'message',
          expectedType: 'string',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'gateway_not_reachable',
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

  it('assertIsRelayerV2ApiError503', () => {
    // Success
    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'readiness_check_timedout',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'response_timedout',
          message: 'hello',
        },
        'Foo',
        {},
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerApiError503({}, 'Foo', {})).toThrow(
      missingPropertyError(
        {
          subject: 'Foo',
          property: 'label',
          expectedType: 'string',
          expectedValue: [
            'protocol_paused',
            'gateway_not_reachable',
            'readiness_check_timedout',
            'response_timedout',
          ],
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError503(
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
          expectedValue: [
            'readiness_check_timedout',
            'response_timedout',
            'protocol_paused',
            'gateway_not_reachable',
          ],
          value: 'foo',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'readiness_check_timedout',
        },
        'Foo',
        {},
      ),
    ).toThrow(
      missingPropertyError(
        {
          subject: 'Foo',
          property: 'message',
          expectedType: 'string',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'response_timedout',
        },
        'Foo',
        {},
      ),
    ).toThrow(
      missingPropertyError(
        {
          subject: 'Foo',
          property: 'message',
          expectedType: 'string',
        },
        {},
      ),
    );

    expect(() =>
      assertIsRelayerApiError503(
        {
          label: 'readiness_check_timedout',
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
