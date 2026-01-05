import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { assertIsRelayerApiError503Type } from './RelayerApiError503';

// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/errors/RelayerV2ApiError503.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/errors/RelayerV2ApiError503.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/errors/RelayerV2ApiError503.ts

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
          'protocol_overwhelmed',
          'protocol_paused',
          'gateway_not_reachable',
          'readiness_check_timedout',
          'response_timedout',
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
          'readiness_check_timedout',
          'response_timedout',
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
          label: 'readiness_check_timedout',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'response_timedout',
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
          'protocol_overwhelmed',
          'protocol_paused',
          'gateway_not_reachable',
          'readiness_check_timedout',
          'response_timedout',
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
          'readiness_check_timedout',
          'response_timedout',
          'protocol_paused',
          'gateway_not_reachable',
        ],
        value: 'foo',
      }),
    );

    expect(() =>
      assertIsRelayerApiError503Type(
        {
          label: 'readiness_check_timedout',
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
          label: 'response_timedout',
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
          label: 'readiness_check_timedout',
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
