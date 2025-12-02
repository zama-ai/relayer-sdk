import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ApiGetError504 } from './RelayerV2ApiGetError504';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ApiGetError504.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ApiGetError504.ts

describe('RelayerV2ApiGetError504', () => {
  it('assertIsRelayerV2ApiGetError504', () => {
    // Success
    expect(() =>
      assertIsRelayerV2ApiGetError504(
        {
          label: 'readiness_check_timedout',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerV2ApiGetError504(
        {
          label: 'response_timedout',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerV2ApiGetError504({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        expectedValue: ['readiness_check_timedout', 'response_timedout'],
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiGetError504(
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
        expectedValue: ['readiness_check_timedout', 'response_timedout'],
        value: 'foo',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiGetError504(
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
      assertIsRelayerV2ApiGetError504(
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
      assertIsRelayerV2ApiGetError504(
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
