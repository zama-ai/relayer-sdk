import { InvalidPropertyError } from '../../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ApiError504 } from './RelayerV2ApiError504';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/errors/RelayerV2ApiError504.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/errors/RelayerV2ApiError504.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/errors/RelayerV2ApiError504.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/errors/RelayerV2ApiError504.ts

describe('RelayerV2ApiError504', () => {
  it('assertIsRelayerV2ApiError504', () => {
    // Success
    expect(() =>
      assertIsRelayerV2ApiError504(
        {
          label: 'readiness_check_timedout',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Success
    expect(() =>
      assertIsRelayerV2ApiError504(
        {
          label: 'response_timedout',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerV2ApiError504({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        expectedValue: ['readiness_check_timedout', 'response_timedout'],
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError504(
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
      assertIsRelayerV2ApiError504(
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
      assertIsRelayerV2ApiError504(
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
      assertIsRelayerV2ApiError504(
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
