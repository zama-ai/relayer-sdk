import fs from 'fs';
import path from 'path';
import { bytesToHex, hexToBytes } from '../utils/bytes';
import { FhevmHandle } from './FhevmHandle';

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

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/sdk/FhevmHandle.test.ts --testNamePattern=xxx

describe('FhevmHandle', () => {
  it('fromZKProof 1', () => {
    const handles = FhevmHandle.fromZKProof({
      ciphertextWithZKProof:
        INPUT_PROOF_ASSET_1.ciphertextWithInputVerification,
      aclAddress: INPUT_PROOF_ASSET_1.aclAddress,
      chainId: INPUT_PROOF_ASSET_1.chainId,
      ciphertextVersion: INPUT_PROOF_ASSET_1.ciphertextVersion,
      fheTypeEncryptionBitwidths:
        INPUT_PROOF_ASSET_1.fheTypeEncryptionBitwidths,
    });
    expect(handles[0].toBytes32Hex()).toEqual(INPUT_PROOF_ASSET_1.handles[0]);

    for (let i = 0; i < handles.length; ++i) {
      const h = handles[i].toBytes32Hex();
      expect(FhevmHandle.fromBytes32Hex(h).toBytes32Hex()).toEqual(
        INPUT_PROOF_ASSET_1.handles[i],
      );
      expect(FhevmHandle.fromComponents(handles[i]).toBytes32Hex()).toEqual(
        INPUT_PROOF_ASSET_1.handles[i],
      );
      expect(handles[i].encryptedBitwidth).toEqual(
        INPUT_PROOF_ASSET_1.fheTypeEncryptionBitwidths[i],
      );
    }
  });

  it('fromZKProof 2', () => {
    const handles = FhevmHandle.fromZKProof({
      ciphertextWithZKProof:
        INPUT_PROOF_ASSET_2.ciphertextWithInputVerification,
      aclAddress: INPUT_PROOF_ASSET_2.aclAddress,
      chainId: INPUT_PROOF_ASSET_2.chainId,
      ciphertextVersion: INPUT_PROOF_ASSET_2.ciphertextVersion,
      fheTypeEncryptionBitwidths:
        INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths,
    });
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
      expect(handles[i].encryptedBitwidth).toEqual(
        INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths[i],
      );
    }
  });

  it('fromZKProof 3', () => {
    const handles = FhevmHandle.fromZKProof({
      ciphertextWithZKProof:
        INPUT_PROOF_ASSET_3.ciphertextWithInputVerification,
      aclAddress: INPUT_PROOF_ASSET_3.aclAddress,
      chainId: INPUT_PROOF_ASSET_3.chainId,
      ciphertextVersion: INPUT_PROOF_ASSET_3.ciphertextVersion,
      fheTypeEncryptionBitwidths:
        INPUT_PROOF_ASSET_3.fheTypeEncryptionBitwidths,
    });
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
      expect(handles[i].encryptedBitwidth).toEqual(
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
