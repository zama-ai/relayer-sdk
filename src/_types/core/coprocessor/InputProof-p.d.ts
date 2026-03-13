import type { Bytes, Bytes32, Bytes32Hex, Bytes32HexAble, Bytes65Hex, BytesHex, ChecksummedAddress } from "../types/primitives.js";
import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { InputProof, InputProofBytes, UnverifiedInputProof, VerifiedInputProof } from "../types/inputProof.js";
export declare function createUnverifiedInputProofFromComponents(args: {
    readonly coprocessorEIP712Signatures: readonly Bytes65Hex[];
    readonly externalHandles: readonly Bytes32Hex[] | readonly Bytes32[] | readonly Bytes32HexAble[];
    readonly extraData: BytesHex;
}): UnverifiedInputProof;
export declare function createInputProofFromComponents({ coprocessorEIP712Signatures, externalHandles, extraData, coprocessorSignedParams, }: {
    readonly coprocessorEIP712Signatures: readonly Bytes65Hex[];
    readonly externalHandles: readonly Bytes32Hex[] | readonly Bytes32[] | readonly Bytes32HexAble[];
    readonly extraData: BytesHex;
    readonly coprocessorSignedParams?: {
        readonly userAddress: ChecksummedAddress;
        readonly contractAddress: ChecksummedAddress;
    } | undefined;
}): InputProof;
export declare function createUnverifiedInputProofFromRawBytes(inputProofBytes: Bytes): UnverifiedInputProof;
export declare function createInputProofFromRawBytes({ inputProofBytes, coprocessorSignedParams, }: {
    readonly inputProofBytes: Bytes;
    readonly coprocessorSignedParams?: {
        readonly userAddress: ChecksummedAddress;
        readonly contractAddress: ChecksummedAddress;
    };
}): InputProof;
/**
 * Validates that the provided handles and inputProof bytes match this InputProof.
 * Use this as a sanity check to ensure handles correspond to the proof data.
 */
export declare function inputProofBytesEquals(bytesA: InputProofBytes, bytesB: InputProofBytes): boolean;
export declare function isInputProof(value: unknown): value is InputProof;
export declare function assertIsInputProof(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is InputProof;
export declare function isVerifiedInputProof(value: unknown): value is VerifiedInputProof & {
    readonly coprocessorSignedParams: {
        readonly userAddress: ChecksummedAddress;
        readonly contractAddress: ChecksummedAddress;
    };
};
export declare function assertIsVerifiedInputProof(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is VerifiedInputProof;
export declare function toInputProofBytes(inputProof: InputProof): InputProofBytes;
//# sourceMappingURL=InputProof-p.d.ts.map