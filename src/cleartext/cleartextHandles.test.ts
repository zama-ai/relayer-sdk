import { computeCleartextHandles } from './cleartextHandles';
import { FhevmHandle } from '@sdk/FhevmHandle';
import type {
  ChecksummedAddress,
  EncryptionBits,
} from '@base/types/primitives';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/cleartext/cleartextHandles.test.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('computeCleartextHandles', () => {
  const ACL =
    '0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2' as ChecksummedAddress;
  const CHAIN_ID = 17000n;

  it('produces valid FhevmHandle objects', () => {
    const { handles } = computeCleartextHandles({
      values: [42n],
      encryptionBits: [8 as EncryptionBits],
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
    });

    expect(handles).toHaveLength(1);
    expect(handles[0]).toBeInstanceOf(FhevmHandle);
    expect(handles[0].fheTypeId).toBe(2); // euint8
    expect(handles[0].index).toBe(0);
    expect(handles[0].computed).toBe(false);
  });

  it('is deterministic (same inputs produce same handles)', () => {
    const params = {
      values: [42n, 1000n],
      encryptionBits: [8, 16] as EncryptionBits[],
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
    };

    const { handles: h1 } = computeCleartextHandles(params);
    const { handles: h2 } = computeCleartextHandles(params);

    expect(h1[0].toBytes32Hex()).toBe(h2[0].toBytes32Hex());
    expect(h1[1].toBytes32Hex()).toBe(h2[1].toBytes32Hex());
  });

  it('produces different handles for different values', () => {
    const base = {
      encryptionBits: [8] as EncryptionBits[],
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
    };

    const { handles: h1 } = computeCleartextHandles({
      ...base,
      values: [42n],
    });
    const { handles: h2 } = computeCleartextHandles({
      ...base,
      values: [43n],
    });

    expect(h1[0].toBytes32Hex()).not.toBe(h2[0].toBytes32Hex());
  });

  it('produces different handles for different chain IDs', () => {
    const base = {
      values: [42n],
      encryptionBits: [8] as EncryptionBits[],
      aclContractAddress: ACL,
    };

    const { handles: h1 } = computeCleartextHandles({
      ...base,
      chainId: 17000n,
    });
    const { handles: h2 } = computeCleartextHandles({
      ...base,
      chainId: 11155111n,
    });

    expect(h1[0].toBytes32Hex()).not.toBe(h2[0].toBytes32Hex());
  });

  it('serializes handles to valid bytes32', () => {
    const { handles } = computeCleartextHandles({
      values: [42n],
      encryptionBits: [8 as EncryptionBits],
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
    });

    const bytes32 = handles[0].toBytes32();
    expect(bytes32.length).toBe(32);

    // Can round-trip through FhevmHandle.from
    const restored = FhevmHandle.from(bytes32);
    expect(restored.toBytes32Hex()).toBe(handles[0].toBytes32Hex());
  });

  it('assigns correct FHE type IDs for multiple types', () => {
    const { handles } = computeCleartextHandles({
      values: [1n, 42n, 1000n, 0n],
      encryptionBits: [2, 8, 32, 64] as EncryptionBits[],
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
    });

    expect(handles).toHaveLength(4);
    expect(handles[0].fheTypeId).toBe(0); // ebool (2 bits → id 0)
    expect(handles[1].fheTypeId).toBe(2); // euint8
    expect(handles[2].fheTypeId).toBe(4); // euint32
    expect(handles[3].fheTypeId).toBe(5); // euint64
  });

  it('assigns sequential indices', () => {
    const { handles } = computeCleartextHandles({
      values: [1n, 2n, 3n],
      encryptionBits: [8, 16, 32] as EncryptionBits[],
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
    });

    expect(handles[0].index).toBe(0);
    expect(handles[1].index).toBe(1);
    expect(handles[2].index).toBe(2);
  });

  it('throws if values/bits length mismatch', () => {
    expect(() =>
      computeCleartextHandles({
        values: [42n, 100n],
        encryptionBits: [8 as EncryptionBits],
        aclContractAddress: ACL,
        chainId: CHAIN_ID,
      }),
    ).toThrow('values and encryptionBits must have the same length');
  });
});
