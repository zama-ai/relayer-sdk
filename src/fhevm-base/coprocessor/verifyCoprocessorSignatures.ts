import type {
  Bytes32,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  UintBigInt,
} from '@base/types/primitives';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import type {
  CoprocessorEIP712Message,
  FhevmHandle,
  InputVerifierContractData,
  ZKProof,
} from '../types/public-api';
import { assertCoprocessorSignerThreshold } from '@fhevm-base/host-contracts/InputVerifierContractData';
import { recoverCoprocessorEIP712Signers } from './CoprocessorEIP712';
import { assertIsZKProof } from './ZKProof';

export async function verifyHandlesCoprocessorSignatures(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
    readonly config: { readonly inputVerifier: InputVerifierContractData };
  },
  args: {
    readonly coprocessorSignatures: readonly Bytes65Hex[];
    readonly handles: readonly FhevmHandle[];
    readonly userAddress: ChecksummedAddress;
    readonly contractAddress: ChecksummedAddress;
    readonly chainId: UintBigInt;
    readonly extraData: BytesHex;
  },
): Promise<void> {
  const handlesBytes32: Bytes32[] = args.handles.map((h) => h.bytes32);

  const message: CoprocessorEIP712Message = {
    ctHandles: handlesBytes32,
    userAddress: args.userAddress,
    contractAddress: args.contractAddress,
    contractChainId: args.chainId,
    extraData: args.extraData,
  };

  // 1. Verify signatures
  const recoveredAddresses = await recoverCoprocessorEIP712Signers(fhevm, {
    domain: fhevm.config.inputVerifier.eip712Domain,
    signatures: args.coprocessorSignatures,
    message,
  });

  // 2. Verify signature theshold is reached
  assertCoprocessorSignerThreshold(
    fhevm.config.inputVerifier,
    recoveredAddresses,
  );
}

export async function verifyZKProofCoprocessorSignatures(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
    readonly config: { readonly inputVerifier: InputVerifierContractData };
  },
  args: {
    readonly zkProof: ZKProof;
    readonly coprocessorSignatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  },
): Promise<void> {
  assertIsZKProof(args.zkProof, {});

  return verifyHandlesCoprocessorSignatures(fhevm, {
    handles: args.zkProof.getFhevmHandles(),
    userAddress: args.zkProof.userAddress,
    contractAddress: args.zkProof.contractAddress,
    chainId: args.zkProof.chainId,
    extraData: args.extraData,
    coprocessorSignatures: args.coprocessorSignatures,
  });
}
