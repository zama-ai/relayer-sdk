import { fromHexString } from '../utils';
import { generateKeypair, createEIP712 } from './keypair';
import {
  ml_kem_pke_pk_to_u8vec,
  ml_kem_pke_sk_to_u8vec,
  u8vec_to_ml_kem_pke_pk,
  u8vec_to_ml_kem_pke_sk,
} from 'node-tkms';

describe('token', () => {
  it('generate a valid keypair', async () => {
    const keypair = generateKeypair();

    const ml_kem_ct_pk_length = 1568; // for MlKem1024Params
    const ml_kem_sk_len = 3168; // for MlKem1024Params

    // note that the keypair is in hex format
    // so the length is double the byte length
    // due to serialization, there's an additional 8 bytes
    expect(keypair.publicKey.length).toBe((ml_kem_ct_pk_length + 8) * 2);
    expect(keypair.privateKey.length).toBe((ml_kem_sk_len + 8) * 2);

    let pkBuf = ml_kem_pke_pk_to_u8vec(
      u8vec_to_ml_kem_pke_pk(fromHexString(keypair.publicKey)),
    );
    expect(ml_kem_ct_pk_length + 8).toBe(pkBuf.length);

    let skBuf = ml_kem_pke_sk_to_u8vec(
      u8vec_to_ml_kem_pke_sk(fromHexString(keypair.privateKey)),
    );
    expect(ml_kem_sk_len + 8).toBe(skBuf.length);
  });

  it('create a valid EIP712', async () => {
    const keypair = generateKeypair();

    const eip712 = createEIP712(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      12345,
    )(
      keypair.publicKey,
      ['0x8ba1f109551bd432803012645ac136ddd64dba72'],
      Date.now(),
      86400,
    );

    expect(eip712.domain.chainId).toBe(12345);
    expect(eip712.domain.name).toBe('Decryption');
    expect(eip712.domain.version).toBe('1');
    expect(eip712.message.publicKey).toBe(`0x${keypair.publicKey}`);
    expect(eip712.primaryType).toBe('UserDecryptRequestVerification');
    expect(eip712.types.UserDecryptRequestVerification.length).toBe(5);
    expect(eip712.types.UserDecryptRequestVerification[0].name).toBe(
      'publicKey',
    );
    expect(eip712.types.UserDecryptRequestVerification[0].type).toBe('bytes');
  });

  it('create a valid EIP712 with delegated accunt', async () => {
    const keypair = generateKeypair();

    const eip712 = createEIP712(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      12345,
    )(
      keypair.publicKey,
      ['0x8ba1f109551bd432803012645ac136ddd64dba72'],
      Date.now(),
      86400,
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );

    expect(eip712.domain.chainId).toBe(12345);
    expect(eip712.domain.name).toBe('Decryption');
    expect(eip712.domain.version).toBe('1');
    expect(eip712.message.publicKey).toBe(`0x${keypair.publicKey}`);
    expect(eip712.message.delegatedAccount).toBe(
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    expect(eip712.primaryType).toBe('DelegatedUserDecryptRequestVerification');

    /* 
     { name: 'publicKey', type: 'bytes' },
          { name: 'contractAddresses', type: 'address[]' },
          { name: 'contractsChainId', type: 'uint256' },
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
      'contractsChainId',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[2].type).toBe(
      'uint256',
    );

    expect(eip712.types.DelegatedUserDecryptRequestVerification[3].name).toBe(
      'startTimestamp',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[3].type).toBe(
      'uint256',
    );

    expect(eip712.types.DelegatedUserDecryptRequestVerification[4].name).toBe(
      'durationDays',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[4].type).toBe(
      'uint256',
    );

    expect(eip712.types.DelegatedUserDecryptRequestVerification[5].name).toBe(
      'delegatedAccount',
    );
    expect(eip712.types.DelegatedUserDecryptRequestVerification[5].type).toBe(
      'address',
    );
  });

  it('create invalid EIP712', async () => {
    const keypair = generateKeypair();

    expect(() =>
      createEIP712('0x8ba1f109551bd432803012645ac136ddd64dba72', 12345)(
        keypair.publicKey,
        ['99'],
        Date.now(),
        86400,
      ),
    ).toThrow('Invalid contract address.');
    expect(() =>
      createEIP712('0x8ba1f109551bd432803012645ac136ddd64dba72', 12345)(
        keypair.publicKey,
        ['0x8ba1f109551bd432803012645ac136ddd64dba72'],
        Date.now(),
        86400,
        '99',
      ),
    ).toThrow('Invalid delegated account.');
  });
});
