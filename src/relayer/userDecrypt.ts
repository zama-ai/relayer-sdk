import { bytesToBigInt, fromHexString, toHexString } from '../utils';
import {
  u8vec_to_cryptobox_pk,
  new_client,
  process_user_decryption_resp_from_js,
  u8vec_to_cryptobox_sk,
} from 'node-tkms';
import { ethers, getAddress, Interface } from 'ethers';

const aclABI = new Interface([
  'function persistAllowed(bytes32 handle, address account) view returns (bool)',
]);

export type HandleContractPair = {
  ctHandle: Uint8Array | string;
  contractAddress: string;
};

export type HandleContractPairRelayer = {
  ctHandle: string;
  contractAddress: string;
};

export const userDecryptRequest =
  (
    kmsSignatures: string[],
    gatewayChainId: number,
    chainId: number,
    verifyingContractAddress: string,
    aclContractAddress: string,
    relayerUrl: string,
    provider: ethers.JsonRpcProvider | ethers.BrowserProvider,
  ) =>
  async (
    _handles: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: string | number,
    durationDays: string | number,
  ): Promise<bigint[]> => {
    console.log('gatewayChainId', gatewayChainId);
    console.log('chainId', chainId);
    console.log('verifyingContractAddress', verifyingContractAddress);
    console.log('cthandles', _handles);

    // Casting handles if string
    const handles: HandleContractPairRelayer[] = _handles.map((h) => ({
      ctHandle:
        typeof h.ctHandle === 'string'
          ? toHexString(fromHexString(h.ctHandle), true)
          : toHexString(h.ctHandle, true),
      contractAddress: h.contractAddress,
    }));

    const acl = new ethers.Contract(aclContractAddress, aclABI, provider);
    const verifications = handles.map(async ({ ctHandle, contractAddress }) => {
      const userAllowed = await acl.persistAllowed(ctHandle, userAddress);
      const contractAllowed = await acl.persistAllowed(
        ctHandle,
        contractAddress,
      );
      if (!userAllowed) {
        throw new Error(
          `User ${userAddress} is not authorized to user decrypt handle ${ctHandle}!`,
        );
      }
      if (!contractAllowed) {
        throw new Error(
          `dapp contract ${contractAddress} is not authorized to user decrypt handle ${ctHandle}!`,
        );
      }
      if (userAddress === contractAddress) {
        throw new Error(
          `userAddress ${userAddress} should not be equal to contractAddress when requesting user decryption!`,
        );
      }
    });

    await Promise.all(verifications).catch((e) => {
      throw e;
    });

    const payloadForRequest = {
      ctHandleContractPairs: handles,
      requestValidity: {
        startTimestamp: startTimestamp.toString(), // Convert to string
        durationDays: durationDays.toString(), // Convert to string
      },
      contractsChainId: chainId.toString(), // Convert to string
      contractAddresses: contractAddresses.map((c) => getAddress(c)),
      userAddress: getAddress(userAddress),
      signature: signature.replace(/^(0x)/, ''),
      publicKey: publicKey.replace(/^(0x)/, ''),
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadForRequest),
    };
    let pubKey;
    let privKey;
    try {
      pubKey = u8vec_to_cryptobox_pk(fromHexString(publicKey));
      privKey = u8vec_to_cryptobox_sk(fromHexString(privateKey));
    } catch (e) {
      throw new Error('Invalid public or private key', { cause: e });
    }

    let response;
    let json;
    try {
      response = await fetch(`${relayerUrl}/v1/user-decrypt`, options);
      if (!response.ok) {
        throw new Error(
          `User decrypt failed: relayer respond with HTTP code ${response.status}`,
        );
      }
    } catch (e) {
      throw new Error("User decrypt failed: Relayer didn't respond", {
        cause: e,
      });
    }

    try {
      json = await response.json();
    } catch (e) {
      throw new Error("User decrypt failed: Relayer didn't return a JSON", {
        cause: e,
      });
    }

    if (json.status === 'failure') {
      throw new Error(
        "User decrypt failed: the user decryption didn't succeed for an unknown reason",
        { cause: json },
      );
    }

    const client = new_client(kmsSignatures, userAddress, 'default');

    try {
      const buffer = new ArrayBuffer(32);
      const view = new DataView(buffer);
      view.setUint32(28, gatewayChainId, false);
      const chainIdArrayBE = new Uint8Array(buffer);
      const eip712Domain = {
        name: 'Decryption',
        version: '1',
        chain_id: chainIdArrayBE,
        verifying_contract: verifyingContractAddress,
        salt: null,
      };
      // Duplicate payloadForRequest and replace ciphertext_handle with ciphertext_digest.
      // TODO check all ciphertext digests are all the same
      const payloadForVerification = {
        signature,
        client_address: userAddress,
        enc_key: publicKey.replace(/^0x/, ''),
        ciphertext_handles: handles.map((h) => h.ctHandle.replace(/^0x/, '')),
        eip712_verifying_contract: verifyingContractAddress,
      };
      console.log(payloadForVerification);

      const decryption = process_user_decryption_resp_from_js(
        client,
        payloadForVerification,
        eip712Domain,
        json.response,
        pubKey,
        privKey,
        true,
      );

      return decryption.map((d: { bytes: Uint8Array<ArrayBufferLike> }) =>
        bytesToBigInt(d.bytes),
      );
    } catch (e) {
      throw new Error('An error occured during decryption', { cause: e });
    }
  };
