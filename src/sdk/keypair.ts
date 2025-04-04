import { isAddress } from 'ethers';
import { toHexString } from '../utils';
import {
  cryptobox_keygen,
  cryptobox_sk_to_u8vec,
  cryptobox_pk_to_u8vec,
  cryptobox_get_pk,
} from 'node-tkms';

export type EIP712Type = { name: string; type: string };

export type EIP712 = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: string;
    version: string;
  };
  message: any;
  primaryType: string;
  types: {
    [key: string]: EIP712Type[];
  };
};

/**
 * Creates an EIP712 structure specifically for user decrypt requests
 *
 * @param gatewayChainId The chain ID of the gateway
 * @param verifyingContract The address of the contract that will verify the signature
 * @param publicKey The user's public key as a hex string or Uint8Array
 * @param contractAddresses Array of contract addresses that can access the decryption
 * @param contractsChainId The chain ID where the contracts are deployed
 * @param startTimestamp The timestamp when the decryption permission becomes valid
 * @param durationDays How many days the decryption permission remains valid
 * @returns EIP712 typed data structure for user decryption
 */
export const createEIP712 =
  (gatewayChainId: number, verifyingContract: string) =>
  (
    publicKey: string | Uint8Array,
    contractAddresses: string[],
    contractsChainId: string | number,
    startTimestamp: string | number,
    durationDays: string | number,
    delegatedAccount?: string,
  ): EIP712 => {
    if (delegatedAccount && !isAddress(delegatedAccount))
      throw new Error('Invalid delegated account.');

    if (!isAddress(verifyingContract)) {
      throw new Error('Invalid verifying contract address.');
    }

    if (!contractAddresses.every((c) => isAddress(c))) {
      throw new Error('Invalid contract address.');
    }
    // Format the public key based on its type
    const formattedPublicKey =
      typeof publicKey === 'string'
        ? publicKey.startsWith('0x')
          ? publicKey
          : `0x${publicKey}`
        : publicKey;

    // Convert timestamps to strings if they're bigints
    const formattedStartTimestamp =
      typeof startTimestamp === 'number'
        ? startTimestamp.toString()
        : startTimestamp;

    const formattedDurationDays =
      typeof durationDays === 'number' ? durationDays.toString() : durationDays;

    const eip: EIP712 = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        UserDecryptRequestVerification: [
          { name: 'publicKey', type: 'bytes' },
          { name: 'contractAddresses', type: 'address[]' },
          { name: 'contractsChainId', type: 'uint256' },
          { name: 'startTimestamp', type: 'uint256' },
          { name: 'durationDays', type: 'uint256' },
        ],
      },
      primaryType: 'UserDecryptRequestVerification',
      domain: {
        name: 'DecryptionManager',
        version: '1',
        chainId: gatewayChainId,
        verifyingContract,
      },
      message: {
        publicKey: formattedPublicKey,
        contractAddresses,
        contractsChainId,
        startTimestamp: formattedStartTimestamp,
        durationDays: formattedDurationDays,
      },
    };

    if (delegatedAccount) {
      eip.message.delegatedAccount = delegatedAccount;
      eip.types.UserDecryptRequestVerification.push({
        name: 'delegatedAccount',
        type: 'address',
      });
    }
    return eip;
  };

export const generateKeypair = () => {
  const keypair = cryptobox_keygen();
  return {
    publicKey: toHexString(cryptobox_pk_to_u8vec(cryptobox_get_pk(keypair))),
    privateKey: toHexString(cryptobox_sk_to_u8vec(keypair)),
  };
};
