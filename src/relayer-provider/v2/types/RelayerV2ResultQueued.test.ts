import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ResultQueued } from './RelayerV2ResultQueued';

// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/RelayerV2ResultQueued.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultQueued.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultQueued.ts

describe('RelayerV2ResultQueued', () => {
  it('assertIsRelayerV2ResultQueued', () => {
    expect(() =>
      assertIsRelayerV2ResultQueued({ jobId: 'abc' }, 'Foo'),
    ).not.toThrow();

    expect(() => assertIsRelayerV2ResultQueued({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'jobId',
        expectedType: 'string',
      }),
    );

    expect(() => assertIsRelayerV2ResultQueued({ jobId: 123 }, 'Foo')).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'jobId',
        expectedType: 'string',
        type: 'number',
      }),
    );
  });
});
