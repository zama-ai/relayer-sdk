// FhevmInstance is imported as type-only → safe, no runtime WASM dependency
import type { FhevmInstance } from '../index';
import type {
  BytesHex,
  BytesHexNo0x,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { InputProofBytesType } from '@sdk/coprocessor/public-api';
import type {
  KeypairType,
  KmsUserDecryptEIP712Type,
  KmsDelegatedUserDecryptEIP712Type,
} from '@sdk/kms/public-api';
import type {
  HandleContractPair,
  PublicDecryptResults,
  UserDecryptResults,
} from '../types/relayer';
import type { CleartextInstanceConfig } from './types';
import { FhevmHostChainConfig } from '@sdk/fhevmHostChain';
import { KmsEIP712 } from '@sdk/kms/KmsEIP712';
import { ACL } from '@sdk/ACL';
import { CleartextExecutor } from './CleartextExecutor';
import { createCleartextEncryptedInput } from './CleartextEncryptedInput';
import {
  cleartextPublicDecrypt,
  cleartextUserDecrypt,
} from './cleartextDecrypt';
import { randomBytes } from 'ethers';
import { remove0x } from '@base/string';
import { bytesToHex } from '@base/bytes';

export async function createCleartextInstance(
  config: CleartextInstanceConfig,
): Promise<FhevmInstance> {
  // Separate cleartext-only fields from FhevmInstanceConfig-compatible fields.
  // TypeScript excess property checking rejects unknown keys in object literals,
  // so we must destructure before passing to fromUserConfig().
  const { cleartextExecutorAddress, ...baseConfig } = config;

  // Load chain config (reads signers, thresholds from on-chain contracts)
  const hostChainConfig = FhevmHostChainConfig.fromUserConfig({
    ...baseConfig,
    relayerUrl: '',
  });
  const fhevmHostChain = await hostChainConfig.loadFromChain();

  const aclContractAddress = fhevmHostChain.aclContractAddress;
  const chainId = fhevmHostChain.chainId;
  const provider = fhevmHostChain.ethersProvider;

  const executor = new CleartextExecutor({
    executorAddress: cleartextExecutorAddress as ChecksummedAddress,
    provider,
  });

  const acl = new ACL({
    aclContractAddress: aclContractAddress as ChecksummedAddress,
    provider,
  });

  const kmsEIP712 = new KmsEIP712({
    chainId: fhevmHostChain.gatewayChainId,
    verifyingContractAddressDecryption:
      fhevmHostChain.verifyingContractAddressDecryption,
  });

  return {
    config: fhevmHostChain,

    createEncryptedInput(contractAddress: string, userAddress: string) {
      return createCleartextEncryptedInput({
        aclContractAddress,
        chainId,
        contractAddress: contractAddress as ChecksummedAddress,
        userAddress: userAddress as ChecksummedAddress,
      });
    },

    async requestZKProofVerification(): Promise<InputProofBytesType> {
      throw new Error(
        'requestZKProofVerification is not supported in cleartext mode. ' +
          'Use createEncryptedInput().encrypt() instead.',
      );
    },

    generateKeypair(): KeypairType<BytesHexNo0x> {
      // Dummy keypair — not used for real ML-KEM encryption in cleartext mode
      const pub = remove0x(bytesToHex(randomBytes(800)));
      const priv = remove0x(bytesToHex(randomBytes(1632)));
      return {
        publicKey: pub as BytesHexNo0x,
        privateKey: priv as BytesHexNo0x,
      };
    },

    createEIP712(
      publicKey: string,
      contractAddresses: string[],
      startTimestamp: number,
      durationDays: number,
    ): KmsUserDecryptEIP712Type {
      return kmsEIP712.createUserDecryptEIP712({
        publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
        extraData: '0x00' as BytesHex,
      });
    },

    createDelegatedUserDecryptEIP712(
      publicKey: string,
      contractAddresses: string[],
      delegatorAddress: string,
      startTimestamp: number,
      durationDays: number,
    ): KmsDelegatedUserDecryptEIP712Type {
      return kmsEIP712.createDelegatedUserDecryptEIP712({
        publicKey,
        contractAddresses,
        delegatorAddress,
        startTimestamp,
        durationDays,
        extraData: '0x00' as BytesHex,
      });
    },

    async publicDecrypt(
      handles: (string | Uint8Array)[],
    ): Promise<PublicDecryptResults> {
      return cleartextPublicDecrypt(handles, executor, acl);
    },

    async userDecrypt(
      handles: HandleContractPair[],
      _privateKey: string,
      _publicKey: string,
      _signature: string,
      _contractAddresses: string[],
      userAddress: string,
      _startTimestamp: number,
      _durationDays: number,
    ): Promise<UserDecryptResults> {
      // ACL check + direct chain read — skips TKMS/ML-KEM
      return cleartextUserDecrypt(
        handles,
        userAddress as ChecksummedAddress,
        executor,
        acl,
      );
    },

    async delegatedUserDecrypt(
      handleContractPairs: HandleContractPair[],
      _privateKey: string,
      _publicKey: string,
      _signature: string,
      _contractAddresses: string[],
      delegatorAddress: string,
      _delegateAddress: string,
      _startTimestamp: number,
      _durationDays: number,
    ): Promise<UserDecryptResults> {
      // Production checks delegatorAddress, not delegateAddress
      return cleartextUserDecrypt(
        handleContractPairs,
        delegatorAddress as ChecksummedAddress,
        executor,
        acl,
      );
    },

    getPublicKey() {
      return null;
    },

    getPublicParams() {
      return null;
    },
  };
}
