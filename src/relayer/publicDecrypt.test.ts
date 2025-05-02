import { publicDecryptRequest } from './publicDecrypt';
import fetchMock from '@fetch-mock/core';
import { ethers } from 'ethers';

fetchMock.post('https://test-relayer.net/v1/public-decrypt', {
  status: 'success',
  response: {},
});

describe('publicDecrypt', () => {
  it('get public decryption for handle', async () => {
    const public_decrypt = publicDecryptRequest(
      [],
      54321,
      9000,
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      'https://test-relayer.net/',
      new ethers.JsonRpcProvider('https://devnet.zama.ai'),
    );
  });
});
