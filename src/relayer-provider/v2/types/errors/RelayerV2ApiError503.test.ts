import { InvalidPropertyError } from '../../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ApiError503 } from './RelayerV2ApiError503';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/errors/RelayerV2ApiError503.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/errors/RelayerV2ApiError503.ts

describe('RelayerV2ApiError503', () => {
  it('assertIsRelayerV2ApiError503', () => {
    // Success
    expect(() =>
      assertIsRelayerV2ApiError503(
        {
          label: 'protocol_paused',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerV2ApiError503(
        {
          label: 'gateway_not_reachable',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerV2ApiError503({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        expectedValue: ['protocol_paused', 'gateway_not_reachable'],
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError503(
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
        expectedValue: ['protocol_paused', 'gateway_not_reachable'],
        value: 'foo',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError503(
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
      assertIsRelayerV2ApiError503(
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
      assertIsRelayerV2ApiError503(
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
});
