import { TEST_CONFIG } from '../../test/config';
import { asBytesHex, hexToBytes } from '@base/bytes';
import {
  ml_kem_pke_pk_to_u8vec,
  ml_kem_pke_sk_to_u8vec,
  u8vec_to_ml_kem_pke_pk,
  u8vec_to_ml_kem_pke_sk,
} from 'node-tkms';
import { AddressError } from '@base/errors/AddressError';
import { generateTKMSPkeKeypair, toTKMSPkeKeypair } from './TKMSPkeKeypair';
import { createKmsEIP712Builder } from '../kms/KmsEIP712Builder';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TKMSPkeKeypair.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TKMSPkeKeypair.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

describeIfFetchMock('token', () => {
  it('generate a valid keypair', async () => {
    const keypair = generateTKMSPkeKeypair();

    //const ml_kem_ct_length = 768; // for MlKem512Params, unused here
    const ml_kem_pk_length = 800; // for MlKem512Params
    const ml_kem_sk_len = 1632; // for MlKem512Params

    const serialize_overhead = 69; // serialization overhead for safe serialize of ML-KEM key

    // note that the keypair is in hex format
    // so the length is double the byte length
    // due to serialization, there are additional bytes
    expect(keypair.publicKey.length).toBe(
      (ml_kem_pk_length + serialize_overhead) * 2,
    );
    expect(keypair.privateKey.length).toBe((ml_kem_sk_len + 8) * 2);

    let pkBuf = ml_kem_pke_pk_to_u8vec(
      u8vec_to_ml_kem_pke_pk(hexToBytes(keypair.publicKey)),
    );
    expect(ml_kem_pk_length + serialize_overhead).toBe(pkBuf.length);

    let skBuf = ml_kem_pke_sk_to_u8vec(
      u8vec_to_ml_kem_pke_sk(hexToBytes(keypair.privateKey)),
    );
    expect(ml_kem_sk_len + 8).toBe(skBuf.length);
  });

  it('create a valid EIP712', async () => {
    const keypair = generateTKMSPkeKeypair();
    const kmsEIP712Builder = createKmsEIP712Builder({
      chainId: BigInt(12345),
      verifyingContractAddressDecryption:
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    });

    const eip712 = kmsEIP712Builder.createUserDecrypt({
      publicKey: keypair.publicKey,
      contractAddresses: ['0x8ba1f109551bD432803012645Ac136ddd64DBA72'],
      startTimestamp: Date.now(),
      durationDays: 86400,
      extraData: asBytesHex('0x00'),
    });

    expect(eip712.domain.chainId).toBe(12345n);
    expect(eip712.domain.name).toBe('Decryption');
    expect(eip712.domain.version).toBe('1');
    expect((eip712.message as { publicKey: unknown }).publicKey).toBe(
      `0x${keypair.publicKey}`,
    );
    expect(eip712.primaryType).toBe('UserDecryptRequestVerification');
    expect(eip712.types.UserDecryptRequestVerification.length).toBe(5);
    expect(eip712.types.UserDecryptRequestVerification[0].name).toBe(
      'publicKey',
    );
    expect(eip712.types.UserDecryptRequestVerification[0].type).toBe('bytes');
  });

  it('create a valid EIP712 with delegated account', async () => {
    const keypair = generateTKMSPkeKeypair();
    const kmsEIP712Builder = createKmsEIP712Builder({
      chainId: BigInt(12345),
      verifyingContractAddressDecryption:
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    });

    const eip712 = kmsEIP712Builder.createDelegateUserDecrypt({
      publicKey: keypair.publicKey,
      contractAddresses: ['0x8ba1f109551bd432803012645ac136ddd64dba72'],
      startTimestamp: Date.now(),
      durationDays: 86400,
      extraData: asBytesHex('0x00'),
      delegatedAccount: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    });

    expect(eip712.domain.chainId).toBe(12345n);
    expect(eip712.domain.name).toBe('Decryption');
    expect(eip712.domain.version).toBe('1');
    expect((eip712.message as { publicKey: unknown }).publicKey).toBe(
      `0x${keypair.publicKey}`,
    );
    expect(
      (eip712.message as { delegatedAccount: unknown }).delegatedAccount,
    ).toBe('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80');
    expect(eip712.primaryType).toBe('DelegatedUserDecryptRequestVerification');

    /*
      { name: 'publicKey', type: 'bytes' },
      { name: 'contractAddresses', type: 'address[]' },
      { name: 'startTimestamp', type: 'uint256' },
      { name: 'durationDays', type: 'uint256' },
      { name: 'delegatedAccount', type: 'address' },
    */
    expect(eip712.types.DelegatedUserDecryptRequestVerification.length).toBe(6);

    expect(eip712.types.DelegatedUserDecryptRequestVerification[0].name).toBe(
      'publicKey',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[0].type).toBe(
      'bytes',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[1].name).toBe(
      'contractAddresses',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[1].type).toBe(
      'address[]',
    );

    expect(eip712.types.DelegatedUserDecryptRequestVerification[2].name).toBe(
      'startTimestamp',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[2].type).toBe(
      'uint256',
    );

    expect(eip712.types.DelegatedUserDecryptRequestVerification[3].name).toBe(
      'durationDays',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[3].type).toBe(
      'uint256',
    );

    expect(eip712.types.DelegatedUserDecryptRequestVerification[4].name).toBe(
      'extraData',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[4].type).toBe(
      'bytes',
    );

    expect(eip712.types.DelegatedUserDecryptRequestVerification[5].name).toBe(
      'delegatedAccount',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[5].type).toBe(
      'address',
    );
  });

  it('create invalid EIP712', async () => {
    const keypair = generateTKMSPkeKeypair();
    const kmsEIP712Builder = createKmsEIP712Builder({
      chainId: BigInt(12345),
      verifyingContractAddressDecryption:
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    });

    expect(() =>
      kmsEIP712Builder.createUserDecrypt({
        publicKey: keypair.publicKey,
        contractAddresses: ['99'],
        startTimestamp: Date.now(),
        durationDays: 86400,
        extraData: asBytesHex('0x00'),
      }),
    ).toThrow(AddressError);
    expect(() =>
      kmsEIP712Builder.createDelegateUserDecrypt({
        publicKey: keypair.publicKey,
        contractAddresses: ['0x8ba1f109551bd432803012645ac136ddd64dba72'],
        startTimestamp: Date.now(),
        durationDays: 86400,
        delegatedAccount: '99',
        extraData: asBytesHex('0x00'),
      }),
    ).toThrow(AddressError);
  });

  //////////////////////////////////////////////////////////////////////////////
  // TKMSPkeKeypair.from()
  //////////////////////////////////////////////////////////////////////////////

  describe('from()', () => {
    it('creates keypair from hex strings with 0x prefix', () => {
      const original = generateTKMSPkeKeypair();
      const hexKeypair = original.toBytesHex();

      const restored = toTKMSPkeKeypair(hexKeypair);

      expect(restored.publicKey).toBe(original.publicKey);
      expect(restored.privateKey).toBe(original.privateKey);
    });

    it('creates keypair from hex strings without 0x prefix', () => {
      const original = generateTKMSPkeKeypair();
      const hexNo0xKeypair = original.toBytesHexNo0x();

      const restored = toTKMSPkeKeypair(hexNo0xKeypair);

      expect(restored.publicKey).toBe(original.publicKey);
      expect(restored.privateKey).toBe(original.privateKey);
    });

    it('creates keypair from Uint8Array', () => {
      const original = generateTKMSPkeKeypair();
      const bytesKeypair = original.toBytes();

      const restored = toTKMSPkeKeypair(bytesKeypair);

      expect(restored.publicKey).toBe(original.publicKey);
      expect(restored.privateKey).toBe(original.privateKey);
    });

    it('throws for missing publicKey', () => {
      expect(() => toTKMSPkeKeypair({ privateKey: '0xabc' })).toThrow();
    });

    it('throws for missing privateKey', () => {
      expect(() => toTKMSPkeKeypair({ publicKey: '0xabc' })).toThrow();
    });

    it('throws for null value', () => {
      expect(() => toTKMSPkeKeypair(null)).toThrow();
    });

    it('throws for undefined value', () => {
      expect(() => toTKMSPkeKeypair(undefined)).toThrow();
    });

    it('throws for invalid publicKey type', () => {
      expect(() =>
        toTKMSPkeKeypair({ publicKey: 123, privateKey: '0xabc' }),
      ).toThrow();
    });

    it('throws for invalid privateKey type', () => {
      const original = generateTKMSPkeKeypair();
      expect(() =>
        toTKMSPkeKeypair({ publicKey: original.publicKey, privateKey: 123 }),
      ).toThrow();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Conversion methods
  //////////////////////////////////////////////////////////////////////////////

  describe('conversion methods', () => {
    it('toBytesHex() returns keys with 0x prefix', () => {
      const keypair = generateTKMSPkeKeypair();

      const result = keypair.toBytesHex();

      expect(result.publicKey.startsWith('0x')).toBe(true);
      expect(result.privateKey.startsWith('0x')).toBe(true);
    });

    it('toBytesHexNo0x() returns keys without 0x prefix', () => {
      const keypair = generateTKMSPkeKeypair();

      const result = keypair.toBytesHexNo0x();

      expect(result.publicKey.startsWith('0x')).toBe(false);
      expect(result.privateKey.startsWith('0x')).toBe(false);
    });

    it('toBytes() returns Uint8Array keys', () => {
      const keypair = generateTKMSPkeKeypair();

      const result = keypair.toBytes();

      expect(result.publicKey).toBeInstanceOf(Uint8Array);
      expect(result.privateKey).toBeInstanceOf(Uint8Array);
    });

    it('toBytesHex() and toBytesHexNo0x() are consistent', () => {
      const keypair = generateTKMSPkeKeypair();

      const withPrefix = keypair.toBytesHex();
      const withoutPrefix = keypair.toBytesHexNo0x();

      expect(withPrefix.publicKey).toBe(`0x${withoutPrefix.publicKey}`);
      expect(withPrefix.privateKey).toBe(`0x${withoutPrefix.privateKey}`);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toJSON()
  //////////////////////////////////////////////////////////////////////////////

  describe('toJSON()', () => {
    it('returns same format as toBytesHex()', () => {
      const keypair = generateTKMSPkeKeypair();

      const json = JSON.parse(JSON.stringify(keypair));
      const hex = keypair.toBytesHex();

      expect(json).toEqual(hex);
    });

    it('produces valid JSON string', () => {
      const keypair = generateTKMSPkeKeypair();

      const jsonString = JSON.stringify(keypair);
      const parsed = JSON.parse(jsonString);

      expect(parsed.publicKey).toBe(keypair.toBytesHex().publicKey);
      expect(parsed.privateKey).toBe(keypair.toBytesHex().privateKey);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verify()
  //////////////////////////////////////////////////////////////////////////////

  describe('verify()', () => {
    it('does not throw for valid keypair', () => {
      const keypair = generateTKMSPkeKeypair();

      expect(() => keypair.verify()).not.toThrow();
    });

    it('validates round-trip through from()', () => {
      const original = generateTKMSPkeKeypair();
      const restored = toTKMSPkeKeypair(original.toBytesHex());

      expect(() => restored.verify()).not.toThrow();
    });
  });

  describe('verify()', () => {
    it('does not throw for valid keypair', () => {
      const keypair = generateTKMSPkeKeypair();

      expect(() => keypair.verify()).not.toThrow();
    });

    it('throws for mismatched publicKey', () => {
      const keypair1 = generateTKMSPkeKeypair();
      const keypair2 = generateTKMSPkeKeypair();

      // Create a keypair with keypair1's privateKey but keypair2's publicKey
      expect(() =>
        toTKMSPkeKeypair({
          publicKey: keypair2.publicKey,
          privateKey: keypair1.privateKey,
        }),
      ).toThrow('Invalid TKMSPkeKeypair publicKey');
    });

    it('throws for publicKey instead of privateKey', () => {
      const keypair = generateTKMSPkeKeypair();

      expect(() =>
        toTKMSPkeKeypair({
          publicKey: keypair.publicKey,
          privateKey: keypair.publicKey,
        }),
      ).toThrow('Invalid TKMSPkeKeypair privateKey');
    });

    it('throws for too large privateKey', () => {
      const keypair = generateTKMSPkeKeypair();

      expect(() =>
        toTKMSPkeKeypair({
          publicKey: keypair.publicKey,
          privateKey: keypair.privateKey + 'ff',
        }),
      ).toThrow('Invalid TKMSPkeKeypair privateKey');
    });

    it('throws for altered privateKey', () => {
      const keypair = generateTKMSPkeKeypair();
      const sk = keypair.privateKey
        .replaceAll('a', 'e')
        .replaceAll('b', 'e')
        .replaceAll('c', 'e')
        .replaceAll('d', 'e')
        .replaceAll('f', 'e');
      const pk = keypair.publicKey;

      expect(() =>
        toTKMSPkeKeypair({
          publicKey: pk,
          privateKey: sk,
        }),
      ).toThrow('Invalid TKMSPkeKeypair publicKey');
    });

    it('throws for altered privateKey', () => {
      const keypair = generateTKMSPkeKeypair();
      const pk = keypair.publicKey;

      expect(() =>
        toTKMSPkeKeypair({
          publicKey: pk,
          privateKey: 'deadbeef',
        }),
      ).toThrow('Invalid TKMSPkeKeypair privateKey');
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    it('publicKey returns hex without 0x prefix', () => {
      const keypair = generateTKMSPkeKeypair();

      expect(keypair.publicKey.startsWith('0x')).toBe(false);
      expect(keypair.publicKey).toBe(keypair.toBytesHexNo0x().publicKey);
    });

    it('privateKey returns hex without 0x prefix', () => {
      const keypair = generateTKMSPkeKeypair();

      expect(keypair.privateKey.startsWith('0x')).toBe(false);
      expect(keypair.privateKey).toBe(keypair.toBytesHexNo0x().privateKey);
    });
  });
});
