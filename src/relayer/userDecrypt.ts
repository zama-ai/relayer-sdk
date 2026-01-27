import { TKMS as TKMSModule } from '../sdk/lowlevel/wasm-modules';
import type {
  HandleContractPairRelayer,
  RelayerUserDecryptOptionsType,
  RelayerUserDecryptPayload,
  RelayerDelegatedUserDecryptPayload,
} from '@relayer-provider/types/public-api';
import type { BytesHex } from '@base/types/primitives';
import type { Provider as EthersProviderType } from 'ethers';
import type {
  ClearValueType,
  FhevmInstanceOptions,
  HandleContractPair,
  UserDecryptResults,
} from '../types/relayer';
import { Contract, getAddress as ethersGetAddress } from 'ethers';
import { bytesToBigInt, bytesToHex, hexToBytes } from '@base/bytes';
import { AbstractRelayerProvider } from '@relayer-provider/AbstractRelayerProvider';
import { check2048EncryptedBits } from './decryptUtils';

interface DelegatedUserDecryptRequest {
  kmsSigners: string[];
  gatewayChainId: number;
  chainId: number;
  verifyingContractAddressDecryption: string;
  aclContractAddress: string;
  relayerProvider: AbstractRelayerProvider;
  provider: EthersProviderType;
  defaultOptions?: FhevmInstanceOptions;
}

// Add type checking
const getAddress = (value: string): `0x${string}` =>
  ethersGetAddress(value) as `0x${string}`;

const aclABI = [
  'function persistAllowed(bytes32 handle, address account) view returns (bool)',
];

const MAX_USER_DECRYPT_CONTRACT_ADDRESSES = 10;
const MAX_USER_DECRYPT_DURATION_DAYS = BigInt(365);

function formatAccordingToType(
  clearValueAsBigInt: bigint,
  type: number,
): ClearValueType {
  if (type === 0) {
    // ebool
    return clearValueAsBigInt === BigInt(1);
  } else if (type === 7) {
    // eaddress
    return getAddress('0x' + clearValueAsBigInt.toString(16).padStart(40, '0'));
  } else if (type > 8 || type == 1) {
    // type == 1 : euint4 (not supported)
    throw new Error(`Unsupported handle type ${type}`);
  }
  // euintXXX
  return clearValueAsBigInt;
}

function parseKeys(publicKey: string, privateKey: string) {
  try {
    const pubKey = TKMSModule.u8vec_to_ml_kem_pke_pk(hexToBytes(publicKey));
    const privKey = TKMSModule.u8vec_to_ml_kem_pke_sk(hexToBytes(privateKey));
    return { pubKey, privKey };
  } catch (e) {
    throw new Error('Invalid public or private key', { cause: e });
  }
}

function parseHandleContractPairs(
  handles: HandleContractPair[],
): HandleContractPairRelayer[] {
  return handles.map((h) => ({
    handle:
      typeof h.handle === 'string'
        ? bytesToHex(hexToBytes(h.handle))
        : bytesToHex(h.handle),
    contractAddress: getAddress(h.contractAddress),
  }));
}

function validateContractAddresses(contractAddresses: string[]) {
  const contractAddressesLength = contractAddresses.length;
  if (contractAddressesLength === 0) {
    throw Error('contractAddresses is empty');
  }
  if (contractAddressesLength > MAX_USER_DECRYPT_CONTRACT_ADDRESSES) {
    throw Error(
      `contractAddresses max length of ${MAX_USER_DECRYPT_CONTRACT_ADDRESSES} exceeded`,
    );
  }
}

async function validateAclPermissions(
  acl: Contract,
  handleContractPairs: HandleContractPairRelayer[],
  authorizedUserAddress: string,
) {
  const verifications = handleContractPairs.map(
    async ({ handle, contractAddress }) => {
      const userAllowed = await acl.persistAllowed(
        handle,
        authorizedUserAddress,
      );
      const contractAllowed = await acl.persistAllowed(handle, contractAddress);

      if (!userAllowed) {
        throw new Error(
          `User address ${authorizedUserAddress} is not authorized to user decrypt handle ${handle}!`,
        );
      }
      if (!contractAllowed) {
        throw new Error(
          `dapp contract ${contractAddress} is not authorized to user decrypt handle ${handle}!`,
        );
      }
      if (authorizedUserAddress === contractAddress) {
        throw new Error(
          `User address ${authorizedUserAddress} should not be equal to contract address when requesting user decryption!`,
        );
      }
    },
  );

  await Promise.all(verifications);
}

function buildUserDecryptResults(
  handles: `0x${string}`[],
  listBigIntDecryptions: bigint[],
): UserDecryptResults {
  let typesList: number[] = [];
  for (const handle of handles) {
    const hexPair = handle.slice(-4, -2).toLowerCase();
    const typeDiscriminant = parseInt(hexPair, 16);
    typesList.push(typeDiscriminant);
  }

  const results: Record<string, ClearValueType> = {};

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

export const userDecryptRequest =
  ({
    kmsSigners,
    gatewayChainId,
    chainId,
    verifyingContractAddressDecryption,
    aclContractAddress,
    relayerProvider,
    provider,
    defaultOptions,
  }: {
    kmsSigners: string[];
    gatewayChainId: number;
    chainId: number;
    verifyingContractAddressDecryption: string;
    aclContractAddress: string;
    relayerProvider: AbstractRelayerProvider;
    provider: EthersProviderType;
    defaultOptions?: FhevmInstanceOptions;
  }) =>
  async (
    _handles: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: string | number,
    durationDays: string | number,
    options?: RelayerUserDecryptOptionsType,
  ): Promise<UserDecryptResults> => {
    const extraData: BytesHex = '0x00';

    const { pubKey, privKey } = parseKeys(publicKey, privateKey);

    // Sanitize hex strings
    const signatureSanitized = signature.replace(/^(0x)/, '');
    const publicKeySanitized = publicKey.replace(/^(0x)/, '');

    const handleContractPairs = parseHandleContractPairs(_handles);

    check2048EncryptedBits(handleContractPairs.map((h) => h.handle));
    checkDeadlineValidity(BigInt(startTimestamp), BigInt(durationDays));
    validateContractAddresses(contractAddresses);

    const acl = new Contract(aclContractAddress, aclABI, provider);
    await validateAclPermissions(acl, handleContractPairs, userAddress);

    const payloadForRequest: RelayerUserDecryptPayload = {
      handleContractPairs,
      requestValidity: {
        startTimestamp: startTimestamp.toString(), // Convert to string
        durationDays: durationDays.toString(), // Convert to string
      },
      contractsChainId: chainId.toString(), // Convert to string
      contractAddresses: contractAddresses.map((c) => getAddress(c)),
      userAddress: getAddress(userAddress),
      signature: signatureSanitized,
      publicKey: publicKeySanitized,
      extraData,
    };

    const json = await relayerProvider.fetchPostUserDecrypt(payloadForRequest, {
      ...defaultOptions,
      ...options,
    });

    // assume the KMS Signers have the correct order
    let indexedKmsSigners = kmsSigners.map((signer, index) => {
      return TKMSModule.new_server_id_addr(index + 1, signer);
    });

    const client = TKMSModule.new_client(
      indexedKmsSigners,
      userAddress,
      'default',
    );

    try {
      const buffer = new ArrayBuffer(32);
      const view = new DataView(buffer);
      view.setUint32(28, gatewayChainId, false);
      const chainIdArrayBE = new Uint8Array(buffer);
      const eip712Domain = {
        name: 'Decryption',
        version: '1',
        chain_id: chainIdArrayBE,
        verifying_contract: verifyingContractAddressDecryption,
        salt: null,
      };

      const payloadForVerification = {
        signature: signatureSanitized,
        client_address: userAddress,
        enc_key: publicKeySanitized,
        ciphertext_handles: handleContractPairs.map((h) =>
          h.handle.replace(/^0x/, ''),
        ),
        eip712_verifying_contract: verifyingContractAddressDecryption,
      };

      const decryption = TKMSModule.process_user_decryption_resp_from_js(
        client,
        payloadForVerification,
        eip712Domain,
        json, //json.response,
        pubKey,
        privKey,
        true,
      );
      const listBigIntDecryptions = decryption.map(
        (d: { bytes: Uint8Array<ArrayBufferLike> }) => bytesToBigInt(d.bytes),
      );

      const results: UserDecryptResults = buildUserDecryptResults(
        handleContractPairs.map((h) => h.handle),
        listBigIntDecryptions,
      );

      return results;
    } catch (e) {
      throw new Error('An error occured during decryption', { cause: e });
    }
  };

export const delegatedUserDecryptRequest =
  ({
    kmsSigners,
    gatewayChainId,
    chainId,
    verifyingContractAddressDecryption,
    aclContractAddress,
    relayerProvider,
    provider,
    defaultOptions,
  }: DelegatedUserDecryptRequest) =>
  async (
    handleContractPairs: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    delegatorAddress: string,
    delegateAddress: string,
    startTimestamp: string | number,
    durationDays: string | number,
    options?: RelayerUserDecryptOptionsType,
  ): Promise<UserDecryptResults> => {
    const extraData: BytesHex = '0x00';

    const { pubKey, privKey } = parseKeys(publicKey, privateKey);

    // Sanitize hex strings
    const signatureSanitized = signature.replace(/^(0x)/, '');
    const publicKeySanitized = publicKey.replace(/^(0x)/, '');

    const handleContractPairsRelayer =
      parseHandleContractPairs(handleContractPairs);

    check2048EncryptedBits(handleContractPairsRelayer.map((h) => h.handle));
    checkDeadlineValidity(BigInt(startTimestamp), BigInt(durationDays));
    validateContractAddresses(contractAddresses);

    // Check ACL for each handle against delegatorAddress and contractAddress
    const acl = new Contract(aclContractAddress, aclABI, provider);
    await validateAclPermissions(
      acl,
      handleContractPairsRelayer,
      delegatorAddress,
    );

    const delegatedUserDecryptPayload: RelayerDelegatedUserDecryptPayload = {
      handleContractPairs: handleContractPairsRelayer,
      contractsChainId: chainId.toString(),
      contractAddresses: contractAddresses.map((c) => getAddress(c)),
      delegatorAddress: getAddress(delegatorAddress),
      delegateAddress: getAddress(delegateAddress),
      startTimestamp: startTimestamp.toString(),
      durationDays: durationDays.toString(),
      signature: signatureSanitized,
      publicKey: publicKeySanitized,
      extraData,
    };

    const json = await relayerProvider.fetchPostDelegatedUserDecrypt(
      delegatedUserDecryptPayload,
      {
        ...defaultOptions,
        ...options,
      },
    );

    // Assume the KMS signers have the correct order.
    let indexedKmsSigners = kmsSigners.map((signer, index) => {
      return TKMSModule.new_server_id_addr(index + 1, signer);
    });

    const client = TKMSModule.new_client(
      indexedKmsSigners,
      delegateAddress,
      'default',
    );

    try {
      const buffer = new ArrayBuffer(32);
      const view = new DataView(buffer);
      view.setUint32(28, gatewayChainId, false);
      const chainIdArrayBE = new Uint8Array(buffer);
      const eip712Domain = {
        name: 'Decryption',
        version: '1',
        chain_id: chainIdArrayBE,
        verifying_contract: verifyingContractAddressDecryption,
        salt: null,
      };

      const payloadForVerification = {
        signature: signatureSanitized,
        client_address: delegateAddress,
        enc_key: publicKeySanitized,
        ciphertext_handles: handleContractPairsRelayer.map((h) =>
          h.handle.replace(/^0x/, ''),
        ),
        eip712_verifying_contract: verifyingContractAddressDecryption,
      };

      const decryption = TKMSModule.process_user_decryption_resp_from_js(
        client,
        payloadForVerification,
        eip712Domain,
        json,
        pubKey,
        privKey,
        true,
      );
      const listBigIntDecryptions = decryption.map(
        (d: { bytes: Uint8Array<ArrayBufferLike> }) => bytesToBigInt(d.bytes),
      );

      const results: UserDecryptResults = buildUserDecryptResults(
        handleContractPairsRelayer.map((h) => h.handle),
        listBigIntDecryptions,
      );

      return results;
    } catch (e) {
      throw new Error(
        'An error occurred during the delegated user decryption request.',
        {
          cause: e,
        },
      );
    }
  };
