import type {
  RelayerEncryptedInput,
  RelayerInputProofOptionsType,
} from '@relayer-provider/types/public-api';
import type { EncryptedInput } from '@sdk/encrypt';
import type {
  BytesHex,
  ChecksummedAddress,
  EncryptionBits,
  ZKProofType,
} from '@base/types/primitives';
import type { FhevmInstanceOptions } from '../types/relayer';
import { isChecksummedAddress } from '@base/address';
import { AbstractRelayerProvider } from '@relayer-provider/AbstractRelayerProvider';
import { createEncryptedInput } from '@sdk/encrypt';
import { ZKProof } from '@sdk/ZKProof';
import { CoprocessorSignersVerifier } from '@sdk/coprocessor/CoprocessorSignersVerifier';
import { AbstractRelayerFhevm } from '@relayer-provider/AbstractRelayerFhevm';
import { InputProof } from '@sdk/coprocessor/InputProof';

////////////////////////////////////////////////////////////////////////////////

export async function requestCiphertextWithZKProofVerification({
  zkProof,
  coprocessorSignersVerifier,
  relayerProvider,
  extraData,
  options,
}: {
  zkProof: ZKProof;
  coprocessorSignersVerifier: CoprocessorSignersVerifier;
  relayerProvider: AbstractRelayerProvider;
  extraData: BytesHex;
  options?: RelayerInputProofOptionsType;
}): Promise<InputProof> {
  const relayerResult = await relayerProvider.fetchPostInputProofWithZKProof(
    { zkProof, extraData },
    options,
  );

  return coprocessorSignersVerifier.verifyAndComputeInputProof({
    zkProof,
    handles: relayerResult.fhevmHandles,
    signatures: relayerResult.result.signatures,
    extraData,
  });
}

////////////////////////////////////////////////////////////////////////////////

export type RelayerEncryptedInputInternal = RelayerEncryptedInput & {
  _input: EncryptedInput;
};

export const createRelayerEncryptedInput =
  ({
    fhevm,
    capacity,
    defaultOptions,
  }: {
    fhevm: AbstractRelayerFhevm;
    capacity: number;
    defaultOptions?: FhevmInstanceOptions;
  }) =>
  (
    contractAddress: string,
    userAddress: string,
  ): RelayerEncryptedInputInternal => {
    if (!isChecksummedAddress(contractAddress)) {
      throw new Error('Contract address is not a valid address.');
    }

    if (!isChecksummedAddress(userAddress)) {
      throw new Error('User address is not a valid address.');
    }

    const aclContractAddress: ChecksummedAddress =
      fhevm.fhevmHostChain.aclContractAddress;
    const chainId: bigint = fhevm.fhevmHostChain.chainId;
    const relayerProvider = fhevm.relayerProvider;
    const coprocessorSigners = fhevm.fhevmHostChain.coprocessorSigners;
    const gatewayChainId = fhevm.fhevmHostChain.gatewayChainId;
    const threshold = fhevm.fhevmHostChain.coprocessorSignerThreshold;
    const verifyingContractAddressInputVerification =
      fhevm.fhevmHostChain.verifyingContractAddressInputVerification;

    const input = createEncryptedInput({
      aclContractAddress,
      chainId: Number(chainId),
      tfheCompactPublicKey: fhevm.getPublicKeyWasm().wasm,
      tfheCompactPkeCrs: fhevm.getPkeCrsWasmForCapacity(capacity).wasm,
      contractAddress,
      userAddress,
      capacity,
    });

    return {
      _input: input,
      addBool(value: number | bigint | boolean) {
        input.addBool(value);
        return this;
      },
      add8(value: number | bigint) {
        input.add8(value);
        return this;
      },
      add16(value: number | bigint) {
        input.add16(value);
        return this;
      },
      add32(value: number | bigint) {
        input.add32(value);
        return this;
      },
      add64(value: number | bigint) {
        input.add64(value);
        return this;
      },
      add128(value: number | bigint) {
        input.add128(value);
        return this;
      },
      add256(value: number | bigint) {
        input.add256(value);
        return this;
      },
      addAddress(value: string) {
        input.addAddress(value);
        return this;
      },
      getBits(): EncryptionBits[] {
        return input.getBits();
      },
      generateZKProof(): ZKProofType {
        if (input.getBits().length === 0) {
          throw new Error(`Encrypted input must contain at least one value`);
        }

        return ZKProof.fromComponents({
          chainId: BigInt(chainId),
          aclContractAddress: aclContractAddress,
          userAddress: userAddress,
          contractAddress: contractAddress,
          ciphertextWithZKProof: input.encrypt(),
          encryptionBits: input.getBits(),
        });
      },
      encrypt: async (options?: RelayerInputProofOptionsType) => {
        const extraData: `0x${string}` = '0x00';

        if (input.getBits().length === 0) {
          throw new Error(`Encrypted input must contain at least one value`);
        }

        const ciphertext = input.encrypt();

        const zkProof = ZKProof.fromComponents({
          ciphertextWithZKProof: ciphertext,
          chainId: BigInt(chainId),
          aclContractAddress: aclContractAddress,
          encryptionBits: input.getBits(),
          userAddress,
          contractAddress,
        });

        const coprocessorSignersVerifier =
          CoprocessorSignersVerifier.fromAddresses({
            coprocessorSigners,
            gatewayChainId,
            coprocessorSignerThreshold: threshold,
            verifyingContractAddressInputVerification,
          });

        const ip: InputProof = await requestCiphertextWithZKProofVerification({
          zkProof,
          coprocessorSignersVerifier,
          relayerProvider,
          extraData,
          options: {
            ...defaultOptions,
            ...options,
          },
        });

        return ip.toBytes();
      },
    };
  };
