import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { assertIsRelayerApiError500Type } from './RelayerApiError500Type';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/errors/RelayerV2ApiError500.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/errors/RelayerV2ApiError500.ts

describe('RelayerV2ApiError500', () => {
  it('assertIsRelayerV2ApiError500', () => {
    // Success
    expect(() =>
      assertIsRelayerApiError500Type(
        {
          label: 'internal_server_error',
          message: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // Failure
    expect(() => assertIsRelayerApiError500Type({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'label',
        expectedType: 'string',
        expectedValue: 'internal_server_error',
      }),
    );

    expect(() =>
      assertIsRelayerApiError500Type(
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
      assertIsRelayerApiError500Type(
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
      assertIsRelayerApiError500Type(
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
