import { fromHexString } from '../utils';
import { generateKeypair, createEIP712 } from './keypair';
import {
  cryptobox_pk_to_u8vec,
  cryptobox_sk_to_u8vec,
  u8vec_to_cryptobox_pk,
  u8vec_to_cryptobox_sk,
} from 'node-tkms';

describe('token', () => {
  it('generate a valid keypair', async () => {
    const keypair = generateKeypair();

    expect(keypair.publicKey.length).toBe(80);
    expect(keypair.privateKey.length).toBe(80);
    console.log(keypair);

    let pkBuf = cryptobox_pk_to_u8vec(
      u8vec_to_cryptobox_pk(fromHexString(keypair.publicKey)),
    );
    expect(40).toBe(pkBuf.length);

    let skBuf = cryptobox_sk_to_u8vec(
      u8vec_to_cryptobox_sk(fromHexString(keypair.privateKey)),
    );
    expect(40).toBe(skBuf.length);
  });

  

  it('create a valid EIP712', async () => {
    const keypair = generateKeypair();

    const eip712 = createEIP712(1234)(
      keypair.publicKey,
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
    );

    expect(eip712.domain.chainId).toBe(1234);
    expect(eip712.domain.name).toBe('Authorization token');
    expect(eip712.domain.version).toBe('1');
    expect(eip712.message.publicKey).toBe(`0x${keypair.publicKey}`);
    expect(eip712.primaryType).toBe('Reencrypt');
    expect(eip712.types.Reencrypt.length).toBe(1);
    expect(eip712.types.Reencrypt[0].name).toBe('publicKey');
    expect(eip712.types.Reencrypt[0].type).toBe('bytes');
  });

  it('create a valid EIP712 with delegated accunt', async () => {
    const keypair = generateKeypair();

    const eip712 = createEIP712(1234)(
      keypair.publicKey,
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );

    expect(eip712.domain.chainId).toBe(1234);
    expect(eip712.domain.name).toBe('Authorization token');
    expect(eip712.domain.version).toBe('1');
    expect(eip712.message.publicKey).toBe(`0x${keypair.publicKey}`);
    expect(eip712.message.delegatedAccount).toBe(
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    expect(eip712.primaryType).toBe('Reencrypt');
    expect(eip712.types.Reencrypt.length).toBe(2);
    expect(eip712.types.Reencrypt[0].name).toBe('publicKey');
    expect(eip712.types.Reencrypt[0].type).toBe('bytes');
    expect(eip712.types.Reencrypt[1].name).toBe('delegatedAccount');
    expect(eip712.types.Reencrypt[1].type).toBe('address');
  });

  it('create invalid EIP712', async () => {
    const keypair = generateKeypair();

    expect(() =>
      createEIP712(1234)(
        keypair.publicKey,
        '0x8ba1f109551bd432803012645ac136ddd64dba',
      ),
    ).toThrow('Invalid contract address.');
    expect(() =>
      createEIP712(1234)(
        keypair.publicKey,
        '0x8ba1f109551bd432803012645ac136ddd64dba72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c8022',
      ),
    ).toThrow('Invalid delegated account.');
  });
});
