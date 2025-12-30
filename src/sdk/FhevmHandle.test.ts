import fs from 'fs';
import path from 'path';
import { bytesToHex, hexToBytes } from '../utils/bytes';
import { FhevmHandle } from './FhevmHandle';
import { ZKProof } from './ZKProof';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/sdk/FhevmHandle.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////

const INPUT_PROOF_ASSET_1 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../test/assets/input-proof-payload-1.json'),
    'utf-8',
  ),
);

const INPUT_PROOF_ASSET_2 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../test/assets/input-proof-payload-2.json'),
    'utf-8',
  ),
);

const INPUT_PROOF_ASSET_3 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../test/assets/input-proof-payload-3.json'),
    'utf-8',
  ),
);

////////////////////////////////////////////////////////////////////////////////

describe('FhevmHandle', () => {
  it('fromZKProof 1', () => {
    const zkProof = ZKProof.fromComponents({
      ciphertextWithZKProof:
        INPUT_PROOF_ASSET_1.ciphertextWithInputVerification,
      aclContractAddress: INPUT_PROOF_ASSET_1.aclAddress,
      chainId: BigInt(INPUT_PROOF_ASSET_1.chainId),
      encryptionBits: INPUT_PROOF_ASSET_1.fheTypeEncryptionBitwidths,
      contractAddress: INPUT_PROOF_ASSET_1.contractAddress,
      userAddress: INPUT_PROOF_ASSET_1.userAddress,
    });
    const handles = FhevmHandle.fromZKProof(
      zkProof,
      INPUT_PROOF_ASSET_1.ciphertextVersion,
    );
    expect(handles[0].toBytes32Hex()).toEqual(INPUT_PROOF_ASSET_1.handles[0]);

    for (let i = 0; i < handles.length; ++i) {
      const h = handles[i].toBytes32Hex();
      expect(FhevmHandle.fromBytes32Hex(h).toBytes32Hex()).toEqual(
        INPUT_PROOF_ASSET_1.handles[i],
      );
      expect(FhevmHandle.fromComponents(handles[i]).toBytes32Hex()).toEqual(
        INPUT_PROOF_ASSET_1.handles[i],
      );
      expect(handles[i].encryptionBits).toEqual(
        INPUT_PROOF_ASSET_1.fheTypeEncryptionBitwidths[i],
      );
    }
  });

  it('fromZKProof 2', () => {
    const zkProof = ZKProof.fromComponents({
      ciphertextWithZKProof:
        INPUT_PROOF_ASSET_2.ciphertextWithInputVerification,
      aclContractAddress: INPUT_PROOF_ASSET_2.aclAddress,
      chainId: INPUT_PROOF_ASSET_2.chainId,
      encryptionBits: INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths,
      contractAddress: INPUT_PROOF_ASSET_2.contractAddress,
      userAddress: INPUT_PROOF_ASSET_2.userAddress,
    });
    const handles = FhevmHandle.fromZKProof(
      zkProof,
      INPUT_PROOF_ASSET_2.ciphertextVersion,
    );
    expect(handles.length).toEqual(
      INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths.length,
    );
    for (let i = 0; i < handles.length; ++i) {
      expect(handles[i].toBytes32Hex()).toEqual(INPUT_PROOF_ASSET_2.handles[i]);
    }

    for (let i = 0; i < handles.length; ++i) {
      const h = handles[i].toBytes32Hex();
      expect(FhevmHandle.fromBytes32Hex(h).toBytes32Hex()).toEqual(
        INPUT_PROOF_ASSET_2.handles[i],
      );
      expect(FhevmHandle.fromComponents(handles[i]).toBytes32Hex()).toEqual(
        INPUT_PROOF_ASSET_2.handles[i],
      );
      expect(handles[i].encryptionBits).toEqual(
        INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths[i],
      );
    }
  });

  it('fromZKProof 3', () => {
    const zkProof = ZKProof.fromComponents({
      ciphertextWithZKProof:
        INPUT_PROOF_ASSET_3.ciphertextWithInputVerification,
      aclContractAddress: INPUT_PROOF_ASSET_3.aclAddress,
      chainId: INPUT_PROOF_ASSET_3.chainId,
      encryptionBits: INPUT_PROOF_ASSET_3.fheTypeEncryptionBitwidths,
      contractAddress: INPUT_PROOF_ASSET_3.contractAddress,
      userAddress: INPUT_PROOF_ASSET_3.userAddress,
    });
    const handles = FhevmHandle.fromZKProof(
      zkProof,
      INPUT_PROOF_ASSET_3.ciphertextVersion,
    );
    expect(handles.length).toEqual(
      INPUT_PROOF_ASSET_3.fheTypeEncryptionBitwidths.length,
    );
    for (let i = 0; i < handles.length; ++i) {
      expect(handles[i].toBytes32Hex()).toEqual(INPUT_PROOF_ASSET_3.handles[i]);
    }

    for (let i = 0; i < handles.length; ++i) {
      const h = handles[i].toBytes32Hex();
      expect(FhevmHandle.fromBytes32Hex(h).toBytes32Hex()).toEqual(
        INPUT_PROOF_ASSET_3.handles[i],
      );
      expect(FhevmHandle.fromComponents(handles[i]).toBytes32Hex()).toEqual(
        INPUT_PROOF_ASSET_3.handles[i],
      );
      expect(handles[i].encryptionBits).toEqual(
        INPUT_PROOF_ASSET_3.fheTypeEncryptionBitwidths[i],
      );
    }
  });

  it('bytesToHex(hexToBytes)', () => {
    expect(
      bytesToHex(
        hexToBytes(INPUT_PROOF_ASSET_1.ciphertextWithInputVerification),
      ),
    ).toEqual(INPUT_PROOF_ASSET_1.ciphertextWithInputVerification);
  });
});
