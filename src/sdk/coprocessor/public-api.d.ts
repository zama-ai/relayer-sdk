import type {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint256BigInt,
  UintBigInt,
} from '@base/types/primitives';
import type { Prettify } from '@base/types/utils';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import type {
  CoprocessorEIP712,
  CoprocessorEIP712Domain,
  CoprocessorEIP712Message,
  CoprocessorEIP712Types,
  FhevmHandle,
  FhevmHandleLike,
} from '@fhevm-base/types/public-api';
import type { ZKProof } from '../types/public-api';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorEIP712 Types
////////////////////////////////////////////////////////////////////////////////

interface CoprocessorSignersVerifier {
  readonly count: number;
  readonly coprocessorSigners: readonly ChecksummedAddress[];
  readonly coprocessorSignerThreshold: number;
  readonly gatewayChainId: Uint256BigInt;
  readonly verifyingContractAddressInputVerification: ChecksummedAddress;

  verifyFhevmHandles(params: {
    readonly handles: readonly FhevmHandle[];
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
    readonly userAddress: ChecksummedAddress;
    readonly contractAddress: ChecksummedAddress;
    readonly chainId: UintBigInt;
  }): Promise<void>;

  verifyZKProof(params: {
    readonly zkProof: ZKProof;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): Promise<void>;

  verifyZKProofAndComputeInputProof(params: {
    readonly zkProof: ZKProof;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): Promise<InputProof>;
}

export interface CoprocessorEIP712Builder {
  readonly gatewayChainId: Uint256BigInt;
  readonly verifyingContractAddressInputVerification: ChecksummedAddress;
  readonly types: CoprocessorEIP712Types;
  readonly #domain: CoprocessorEIP712Domain;
  create(
    params: Prettify<
      Omit<CoprocessorEIP712Message, 'ctHandles'> & {
        readonly ctHandles: readonly FhevmHandleLike[];
      }
    >,
  ): CoprocessorEIP712;
  verify(params: {
    readonly signatures: readonly Bytes65Hex[];
    readonly message: CoprocessorEIP712Message;
    readonly verifier: EIP712Lib;
  }): Promise<ChecksummedAddress[]>;
}
