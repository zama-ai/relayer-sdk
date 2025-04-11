import { bytesToBigInt, fromHexString, toHexString } from '../utils';
import {
  u8vec_to_cryptobox_pk,
  new_client,
  process_reencryption_resp_from_js,
  u8vec_to_cryptobox_sk,
} from 'node-tkms';
import { ethers, getAddress } from 'ethers';

const aclABI = [
  'function persistAllowed(uint256 handle, address account) view returns (bool)',
];

export const publicDecryptRequest =
  (
    kmsSignatures: string[],
    gatewayChainId: number,
    chainId: number,
    verifyingContractAddress: string,
    aclContractAddress: string,
    relayerUrl: string,
    provider: ethers.JsonRpcProvider | ethers.BrowserProvider,
  ) =>
  async (_handle: Uint8Array | string) => {
    const handle =
      typeof _handle === 'string' ? fromHexString(_handle) : _handle;

    const payloadForRequest = {
      ciphertext_handle: toHexString(handle),
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadForRequest),
    };

    let response;
    let json;
    try {
      response = await fetch(`${relayerUrl}v1/public-decrypt`, options);
      if (!response.ok) {
        throw new Error(
          `Reencrypt failed: relayer respond with HTTP code ${response.status}`,
        );
      }
    } catch (e) {
      throw new Error("Public decrypt failed: Relayer didn't respond", {
        cause: e,
      });
    }

    try {
      json = await response.json();
    } catch (e) {
      throw new Error("Public decrypt failed: Relayer didn't return a JSON", {
        cause: e,
      });
    }

    if (json.status === 'failure') {
      throw new Error(
        "Public decrypt failed: the public decrypt didn't succeed for an unknown reason",
        { cause: json },
      );
    }

    // TODO verify signature on decryption

    return json;
  };
