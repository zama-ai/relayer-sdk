import { InvalidPropertyError } from '../../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ApiError500 } from './RelayerV2ApiError500';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/errors/RelayerV2ApiError500.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/errors/RelayerV2ApiError500.ts

describe('RelayerV2ApiError500', () => {
  it('assertIsRelayerV2ApiError500', () => {
    // Success
    expect(() =>
      assertIsRelayerV2ApiError500(
        {
          label: 'internal_server_error',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerV2ApiError500({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        expectedValue: 'internal_server_error',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError500(
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
        expectedValue: 'internal_server_error',
        value: 'foo',
      }),
    );

    expect(() =>
      assertIsRelayerV2ApiError500(
        {
          label: 'internal_server_error',
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
      assertIsRelayerV2ApiError500(
        {
          label: 'internal_server_error',
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
