import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { assertIsRelayerApiError503Type } from './RelayerApiError503';

// npx jest --colors --passWithNoTests ./src/relayer-provider/errors/RelayerApiError503.test.ts

describe('RelayerV2ApiError503', () => {
  it('assertIsRelayerV2ApiError503', () => {
    // Success
    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'protocol_paused',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'insufficient_balance',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'insufficient_allowance',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'gateway_not_reachable',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerApiError503Type({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        expectedValue: [
          'protocol_paused',
          'insufficient_balance',
          'insufficient_allowance',
          'gateway_not_reachable',
          'readiness_check_timed_out',
          'response_timed_out',
        ],
      }),
    );

    expect(() =>
      assertIsRelayerApiError503Type(
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
        expectedValue: [
          'readiness_check_timed_out',
          'response_timed_out',
          'protocol_paused',
          'gateway_not_reachable',
        ],
        value: 'foo',
      }),
    );

    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'protocol_paused',
        },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'message',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'gateway_not_reachable',
        },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'message',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'gateway_not_reachable',
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

  it('assertIsRelayerV2ApiError503', () => {
    // Success
    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'readiness_check_timed_out',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'response_timed_out',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerApiError503Type({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        expectedValue: [
          'protocol_paused',
          'insufficient_balance',
          'insufficient_allowance',
          'gateway_not_reachable',
          'readiness_check_timed_out',
          'response_timed_out',
        ],
      }),
    );

    expect(() =>
      assertIsRelayerApiError503Type(
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
        expectedValue: [
          'readiness_check_timed_out',
          'response_timed_out',
          'protocol_paused',
          'gateway_not_reachable',
        ],
        value: 'foo',
      }),
    );

    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'readiness_check_timed_out',
        },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'message',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'response_timed_out',
        },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'message',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'readiness_check_timed_out',
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
