import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ResultUserDecrypt } from './RelayerV2ResultUserDecrypt';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultUserDecrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultUserDecrypt.ts

describe('RelayerV2ResultUserDecrypt', () => {
  it('assertIsRelayerV2ResultUserDecrypt', () => {
    // True
    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { payloads: ['deadbeef'], signatures: ['deadbeef'] },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ foo: 'bar' }, 'Foo'),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'payloads',
        expectedType: 'Array',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ payloads: 'bar' }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'payloads',
        expectedType: 'Array',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ payloads: ['bar'] }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'payloads',
        index: 0,
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ payloads: ['deadbeef'] }, 'Foo'),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'signatures',
        expectedType: 'Array',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ payloads: ['0xdeadbeef'] }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'payloads',
        index: 0,
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { payloads: ['deadbeef'], signatures: 'hello' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'signatures',
        expectedType: 'Array',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { payloads: ['deadbeef'], signatures: ['hello'] },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'signatures',
        index: 0,
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );
  });
});
