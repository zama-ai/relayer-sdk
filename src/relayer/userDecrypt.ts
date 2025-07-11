import { bytesToBigInt, fromHexString, toHexString } from '../utils';
import { ethers, getAddress as ethersGetAddress } from 'ethers';
import { DecryptedResults, checkEncryptedBits } from './decryptUtils';
import {
  fetchRelayerJsonRpcPost,
  HandleContractPairRelayer,
  RelayerUserDecryptPayload,
} from './fetchRelayer';

// Add type checking
const getAddress = (value: string): `0x${string}` =>
  ethersGetAddress(value) as `0x${string}`;

const aclABI = [
  'function persistAllowed(bytes32 handle, address account) view returns (bool)',
];

const MAX_USER_DECRYPT_CONTRACT_ADDRESSES = 10;
const MAX_USER_DECRYPT_DURATION_DAYS = BigInt(365);

function formatAccordingToType(
  decryptedBigInt: bigint,
  type: number,
): boolean | bigint | string {
  if (type === 0) {
    // ebool
    return decryptedBigInt === BigInt(1);
  } else if (type === 7) {
    // eaddress
    return getAddress('0x' + decryptedBigInt.toString(16).padStart(40, '0'));
  } else if (type === 9) {
    // ebytes64
    return '0x' + decryptedBigInt.toString(16).padStart(128, '0');
  } else if (type === 10) {
    // ebytes128
    return '0x' + decryptedBigInt.toString(16).padStart(256, '0');
  } else if (type === 11) {
    // ebytes256
    return '0x' + decryptedBigInt.toString(16).padStart(512, '0');
  } // euintXXX
  return decryptedBigInt;
}
function buildUserDecryptedResult(
  handles: string[],
  listBigIntDecryptions: bigint[],
): DecryptedResults {
  let typesList: number[] = [];
  for (const handle of handles) {
    const hexPair = handle.slice(-4, -2).toLowerCase();
    const typeDiscriminant = parseInt(hexPair, 16);
    typesList.push(typeDiscriminant);
  }

  let results: DecryptedResults = {};
  handles.forEach(
    (handle, idx) =>
      (results[handle] = formatAccordingToType(
        listBigIntDecryptions[idx],
        typesList[idx],
      )),
  );

  return results;
}

function checkDeadlineValidity(startTimestamp: bigint, durationDays: bigint) {
  if (durationDays === BigInt(0)) {
    throw Error('durationDays is null');
  }

  if (durationDays > MAX_USER_DECRYPT_DURATION_DAYS) {
    throw Error(
      `durationDays is above max duration of ${MAX_USER_DECRYPT_DURATION_DAYS}`,
    );
  }

  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
  if (startTimestamp > currentTimestamp) {
    throw Error('startTimestamp is set in the future');
  }

  const durationInSeconds = durationDays * BigInt(86400);
  if (startTimestamp + durationInSeconds < currentTimestamp) {
    throw Error('User decrypt request has expired');
  }
}

export type HandleContractPair = {
  handle: Uint8Array | string;
  contractAddress: string;
};

export const userDecryptRequest =
  (
    kmsSigners: string[],
    gatewayChainId: number,
    chainId: number,
    verifyingContractAddress: string,
    aclContractAddress: string,
    relayerUrl: string,
    provider: ethers.JsonRpcProvider | ethers.BrowserProvider,
    options?: { apiKey?: string },
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
  ): Promise<DecryptedResults> => {
    let pubKey;
    let privKey;
    try {
      pubKey = TKMS.u8vec_to_ml_kem_pke_pk(fromHexString(publicKey));
      privKey = TKMS.u8vec_to_ml_kem_pke_sk(fromHexString(privateKey));
    } catch (e) {
      throw new Error('Invalid public or private key', { cause: e });
    }

    // Casting handles if string
    const signatureSanitized = signature.replace(/^(0x)/, '');
    const publicKeySanitized = publicKey.replace(/^(0x)/, '');

    const handles: HandleContractPairRelayer[] = _handles.map((h) => ({
      handle:
        typeof h.handle === 'string'
          ? toHexString(fromHexString(h.handle), true)
          : toHexString(h.handle, true),
      contractAddress: getAddress(h.contractAddress),
    }));

    checkEncryptedBits(handles.map((h) => h.handle));

    checkDeadlineValidity(BigInt(startTimestamp), BigInt(durationDays));

    const acl = new ethers.Contract(aclContractAddress, aclABI, provider);
    const verifications = handles.map(async ({ handle, contractAddress }) => {
      const userAllowed = await acl.persistAllowed(handle, userAddress);
      const contractAllowed = await acl.persistAllowed(handle, contractAddress);
      if (!userAllowed) {
        throw new Error(
          `User ${userAddress} is not authorized to user decrypt handle ${handle}!`,
        );
      }
      if (!contractAllowed) {
        throw new Error(
          `dapp contract ${contractAddress} is not authorized to user decrypt handle ${handle}!`,
        );
      }
      if (userAddress === contractAddress) {
        throw new Error(
          `userAddress ${userAddress} should not be equal to contractAddress when requesting user decryption!`,
        );
      }
    });

    const contractAddressesLength = contractAddresses.length;
    if (contractAddressesLength === 0) {
      throw Error('contractAddresses is empty');
    }
    if (contractAddressesLength > MAX_USER_DECRYPT_CONTRACT_ADDRESSES) {
      throw Error(
        `contractAddresses max length of ${MAX_USER_DECRYPT_CONTRACT_ADDRESSES} exceeded`,
      );
    }

    await Promise.all(verifications).catch((e) => {
      throw e;
    });

    const payloadForRequest: RelayerUserDecryptPayload = {
      handleContractPairs: handles,
      requestValidity: {
        startTimestamp: startTimestamp.toString(), // Convert to string
        durationDays: durationDays.toString(), // Convert to string
      },
      contractsChainId: chainId.toString(), // Convert to string
      contractAddresses: contractAddresses.map((c) => getAddress(c)),
      userAddress: getAddress(userAddress),
      signature: signatureSanitized,
      publicKey: publicKeySanitized,
    };

    const json = await fetchRelayerJsonRpcPost(
      'USER_DECRYPT',
      `${relayerUrl}/v1/user-decrypt`,
      payloadForRequest,
      options,
    );

    // assume the KMS Signers have the correct order
    let indexedKmsSigners = kmsSigners.map((signer, index) => {
      return TKMS.new_server_id_addr(index + 1, signer);
    });

    const client = TKMS.new_client(indexedKmsSigners, userAddress, 'default');

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

      const payloadForVerification = {
        signature: signatureSanitized,
        client_address: userAddress,
        enc_key: publicKeySanitized,
        ciphertext_handles: handles.map((h) => h.handle.replace(/^0x/, '')),
        eip712_verifying_contract: verifyingContractAddress,
      };

      const decryption = TKMS.process_user_decryption_resp_from_js(
        client,
        payloadForVerification,
        eip712Domain,
        json.response,
        pubKey,
        privKey,
        true,
      );
      const listBigIntDecryptions = decryption.map(
        (d: { bytes: Uint8Array<ArrayBufferLike> }) => bytesToBigInt(d.bytes),
      );

      const results = buildUserDecryptedResult(
        handles.map((h) => h.handle),
        listBigIntDecryptions,
      );

      return results;
    } catch (e) {
      throw new Error('An error occured during decryption', { cause: e });
    }
  };
