import fs from 'fs';
import path from 'path';
import createHash from 'keccak';
import { ethers } from 'ethers';
import type {
  Bytes32Hex,
  BytesHex,
  ChecksummedAddress,
  EncryptionBits,
} from '../base/types/primitives';
import { hexToBytes } from '../base/bytes';
import { FhevmHandle } from '../sdk/FhevmHandle';
import { MAX_UINT64 } from '../base/uint';
import { fheTypeIdFromEncryptionBits } from '../sdk/FheType';
import { ZKProof } from '../sdk/ZKProof';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer/handles.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer/handles.test.ts --collectCoverageFrom='./src/relayer/handles.ts'
//
////////////////////////////////////////////////////////////////////////////////

const INPUT_PROOF_ASSET_1 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../test/assets/input-proof-payload-1.json'),
    'utf-8',
  ),
);

const DATA: {
  ciphertextWithZKProof: BytesHex;
  bitwidths: EncryptionBits[];
  aclAddress: ChecksummedAddress;
  chainId: number;
  ciphertextVersion: number;
  handles: Bytes32Hex[];
  userAddress: ChecksummedAddress;
  contractAddress: ChecksummedAddress;
} = {
  ciphertextWithZKProof: INPUT_PROOF_ASSET_1.ciphertextWithInputVerification,
  bitwidths: INPUT_PROOF_ASSET_1.fheTypeEncryptionBitwidths,
  aclAddress: INPUT_PROOF_ASSET_1.aclAddress,
  chainId: INPUT_PROOF_ASSET_1.chainId,
  ciphertextVersion: INPUT_PROOF_ASSET_1.ciphertextVersion,
  handles: INPUT_PROOF_ASSET_1.fetch_json.response.handles,
  userAddress: INPUT_PROOF_ASSET_1.userAddress,
  contractAddress: INPUT_PROOF_ASSET_1.contractAddress,
};

describe('handles', () => {
  it('compute from ZkPok', () => {
    const zkProof = ZKProof.fromComponents({
      ciphertextWithZKProof: hexToBytes(DATA.ciphertextWithZKProof),
      aclContractAddress: DATA.aclAddress as ChecksummedAddress,
      chainId: BigInt(DATA.chainId),
      userAddress: DATA.userAddress,
      contractAddress: DATA.contractAddress,
    });
    const h1 = FhevmHandle.fromZKProof(zkProof, DATA.ciphertextVersion);
    expect(zkProof.encryptionBits).toEqual(DATA.bitwidths);
    expect(h1[0].toBytes32Hex()).toEqual(DATA.handles[0]);
  });

  it('equivalence testing', () => {
    const ciphertextVersion = 0;
    const zkProof = ZKProof.fromComponents({
      ciphertextWithZKProof: hexToBytes(DATA.ciphertextWithZKProof),
      aclContractAddress: DATA.aclAddress,
      chainId: DATA.chainId,
      encryptionBits: DATA.bitwidths,
      contractAddress: DATA.contractAddress,
      userAddress: DATA.userAddress,
    });
    const h1 = FhevmHandle.fromZKProof(zkProof, ciphertextVersion);
    const h2 = computeHandles(
      zkProof.ciphertextWithZKProof,
      zkProof.encryptionBits,
      zkProof.aclContractAddress,
      Number(zkProof.chainId),
      ciphertextVersion,
    );
    for (let i = 0; i < h1.length; ++i) {
      expect(h1[i].toBytes32()).toEqual(h2[i]);
      expect(h1[i].toBytes32Hex()).toEqual(ethers.hexlify(h2[i]));
    }
  });
});

function computeHandles(
  ciphertextWithZKProof: Uint8Array,
  bitwidths: readonly EncryptionBits[],
  aclContractAddress: string,
  chainId: number,
  ciphertextVersion: number,
) {
  // Should be identical to:
  // https://github.com/zama-ai/fhevm/blob/e3cd9f3c25851fcbe960c9f337e7214edefe8e64/coprocessor/fhevm-engine/zkproof-worker/src/verifier.rs#L459
  const blob_hash = createHash('keccak256')
    .update(Buffer.from(FhevmHandle.RAW_CT_HASH_DOMAIN_SEPARATOR))
    .update(Buffer.from(ciphertextWithZKProof))
    .digest();
  const aclContractAddress20Bytes = Buffer.from(hexToBytes(aclContractAddress));
  const hex = chainId.toString(16).padStart(64, '0'); // 64 hex chars = 32 bytes
  const chainId32Bytes = Buffer.from(hex, 'hex');
  const handles = bitwidths.map((bitwidth, encryptionIndex) => {
    const encryptionType = fheTypeIdFromEncryptionBits(bitwidth);
    const encryptionIndex1Byte = Buffer.from([encryptionIndex]);
    const handleHash = createHash('keccak256')
      .update(Buffer.from(FhevmHandle.HANDLE_HASH_DOMAIN_SEPARATOR))
      .update(blob_hash)
      .update(encryptionIndex1Byte)
      .update(aclContractAddress20Bytes)
      .update(chainId32Bytes)
      .digest();
    const dataInput = new Uint8Array(32);
    dataInput.set(handleHash, 0);

    // Check if chainId exceeds 8 bytes
    if (BigInt(chainId) > MAX_UINT64) {
      throw new Error('ChainId exceeds maximum allowed value (8 bytes)'); // fhevm assumes chainID is only taking up to 8 bytes
    }

    const chainId8Bytes = hexToBytes(hex).slice(24, 32);
    dataInput[21] = encryptionIndex;
    dataInput.set(chainId8Bytes, 22);
    dataInput[30] = encryptionType;
    dataInput[31] = ciphertextVersion;

    return dataInput;
  });

  return handles;
}
