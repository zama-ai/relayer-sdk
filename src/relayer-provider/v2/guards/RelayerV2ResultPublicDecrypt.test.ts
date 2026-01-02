import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ResultPublicDecrypt } from './RelayerV2ResultPublicDecrypt';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/RelayerV2ResultPublicDecrypt.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultPublicDecrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultPublicDecrypt.ts

describe('RelayerV2ResultPublicDecrypt', () => {
  it('assertIsRelayerV2ResultPublicDecrypt', () => {
    // True
    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt(
        {
          extraData: '0x00',
          signatures: ['deadbeef'],
          decryptedValue: 'dead',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2ResultPublicDecrypt({}, 'Foo')).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'signatures',
        expectedType: 'Array',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt({ signatures: 'hello' }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'signatures',
        expectedType: 'Array',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt({ signatures: ['hello'] }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'signatures',
        index: 0,
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt(
        { signatures: ['0xdeadbeef'] },
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

    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt({ signatures: ['deadbeef'] }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'decryptedValue',
        expectedType: 'BytesHexNo0x',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt({ signatures: ['deadbeef'] }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'decryptedValue',
        expectedType: 'BytesHexNo0x',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt(
        { signatures: ['deadbeef'], decryptedValue: 'deadbeef' },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'extraData',
        expectedType: 'BytesHex',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt(
        {
          signatures: ['deadbeef'],
          decryptedValue: 'deadbeef',
          extraData: 123,
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'extraData',
        expectedType: 'BytesHex',
        type: 'number',
      }),
    );
  });
});
