import {
  cleartextPublicDecrypt,
  cleartextUserDecrypt,
} from './cleartextDecrypt';
import { CleartextExecutor } from './CleartextExecutor';
import { ACL } from '@sdk/ACL';
import { FhevmHandle } from '@sdk/FhevmHandle';
import type { ChecksummedAddress, Bytes32Hex } from '@base/types/primitives';
import { ACLPublicDecryptionError } from '../errors/ACLError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/cleartext/cleartextDecrypt.test.ts
//
////////////////////////////////////////////////////////////////////////////////

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ACL_ADDRESS =
  '0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2' as ChecksummedAddress;
const USER_ADDRESS =
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as ChecksummedAddress;
const CONTRACT_ADDRESS =
  '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413' as ChecksummedAddress;

// Build a handle with fheTypeId=4 (euint32)
const HANDLE_EUINT32 = FhevmHandle.fromComponents({
  hash21: '0x0102030405060708091011121314151617181920ab' as `0x${string}`,
  chainId: 17000n,
  fheTypeId: 4,
  version: FhevmHandle.CURRENT_CIPHERTEXT_VERSION,
  computed: false,
  index: 0,
});
const HANDLE_HEX = HANDLE_EUINT32.toBytes32Hex();

// Build a handle with fheTypeId=0 (ebool)
const HANDLE_EBOOL = FhevmHandle.fromComponents({
  hash21: '0xaabbccdd05060708091011121314151617181920ef' as `0x${string}`,
  chainId: 17000n,
  fheTypeId: 0,
  version: FhevmHandle.CURRENT_CIPHERTEXT_VERSION,
  computed: false,
  index: 0,
});

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

function createMockExecutor(
  plaintexts: Map<string, bigint>,
): CleartextExecutor {
  return {
    getPlaintext: jest.fn(async (h: Bytes32Hex) => plaintexts.get(h) ?? 0n),
    getPlaintexts: jest.fn(async (handles: Bytes32Hex[]) =>
      handles.map((h) => plaintexts.get(h) ?? 0n),
    ),
  } as unknown as CleartextExecutor;
}

function createMockACL(opts: {
  isAllowedForDecryption?: (handle: string) => boolean;
  persistAllowed?: (handle: string, address: string) => boolean;
}): ACL {
  const acl = Object.create(ACL.prototype) as ACL;

  // Override checkAllowedForDecryption
  (acl as unknown as Record<string, unknown>).checkAllowedForDecryption =
    jest.fn(async (handles: FhevmHandle[] | FhevmHandle) => {
      const arr = Array.isArray(handles) ? handles : [handles];
      const checker = opts.isAllowedForDecryption ?? (() => true);
      const failed = arr
        .filter((h) => !checker(h.toBytes32Hex()))
        .map((h) => h.toBytes32Hex());
      if (failed.length > 0) {
        throw new ACLPublicDecryptionError({
          contractAddress: ACL_ADDRESS,
          handles: failed,
        });
      }
    });

  // Override checkUserAllowedForDecryption
  (acl as unknown as Record<string, unknown>).checkUserAllowedForDecryption =
    jest.fn(
      async (params: {
        userAddress: ChecksummedAddress;
        handleContractPairs: Array<{
          contractAddress: ChecksummedAddress;
          handle: FhevmHandle;
        }>;
      }) => {
        const checker = opts.persistAllowed ?? (() => true);
        for (const pair of params.handleContractPairs) {
          const handleHex = pair.handle.toBytes32Hex();
          if (!checker(handleHex, params.userAddress)) {
            throw new Error(
              `User ${params.userAddress} is not authorized to user decrypt handle ${handleHex}!`,
            );
          }
          if (!checker(handleHex, pair.contractAddress)) {
            throw new Error(
              `dapp contract ${pair.contractAddress} is not authorized to user decrypt handle ${handleHex}!`,
            );
          }
        }
      },
    );

  return acl;
}

// ---------------------------------------------------------------------------
// Tests — publicDecrypt
// ---------------------------------------------------------------------------

describe('cleartextPublicDecrypt', () => {
  it('returns formatted clearValues when ACL allows', async () => {
    const plaintexts = new Map([[HANDLE_HEX, 42n]]);
    const executor = createMockExecutor(plaintexts);
    const acl = createMockACL({});

    const result = await cleartextPublicDecrypt([HANDLE_HEX], executor, acl);

    expect(result.clearValues[HANDLE_HEX]).toBe(42n);
    expect(result.decryptionProof).toBe('0x00');
    expect(acl.checkAllowedForDecryption).toHaveBeenCalledTimes(1);
  });

  it('converts ebool plaintext to boolean', async () => {
    const boolHex = HANDLE_EBOOL.toBytes32Hex();
    const plaintexts = new Map([[boolHex, 1n]]);
    const executor = createMockExecutor(plaintexts);
    const acl = createMockACL({});

    const result = await cleartextPublicDecrypt([boolHex], executor, acl);

    expect(result.clearValues[boolHex]).toBe(true);
  });

  it('throws ACLPublicDecryptionError when handle is not allowed', async () => {
    const executor = createMockExecutor(new Map([[HANDLE_HEX, 42n]]));
    const acl = createMockACL({
      isAllowedForDecryption: () => false,
    });

    const err = await cleartextPublicDecrypt([HANDLE_HEX], executor, acl).catch(
      (e: unknown) => e,
    );

    expect(err).toBeInstanceOf(ACLPublicDecryptionError);
    expect((err as ACLPublicDecryptionError).handles).toContain(HANDLE_HEX);
    expect(executor.getPlaintexts).not.toHaveBeenCalled();
  });

  it('rejects only disallowed handles in a mixed batch', async () => {
    const boolHex = HANDLE_EBOOL.toBytes32Hex();
    const executor = createMockExecutor(
      new Map([
        [HANDLE_HEX, 42n],
        [boolHex, 1n],
      ]),
    );
    const acl = createMockACL({
      isAllowedForDecryption: (h) => h !== HANDLE_HEX,
    });

    const err = await cleartextPublicDecrypt(
      [HANDLE_HEX, boolHex],
      executor,
      acl,
    ).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ACLPublicDecryptionError);
    expect((err as ACLPublicDecryptionError).handles).toContain(HANDLE_HEX);
    expect((err as ACLPublicDecryptionError).handles).not.toContain(boolHex);
    expect(executor.getPlaintexts).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests — userDecrypt
// ---------------------------------------------------------------------------

describe('cleartextUserDecrypt', () => {
  it('returns formatted results when ACL allows', async () => {
    const plaintexts = new Map([[HANDLE_HEX, 100n]]);
    const executor = createMockExecutor(plaintexts);
    const acl = createMockACL({});

    const result = await cleartextUserDecrypt(
      [{ handle: HANDLE_HEX, contractAddress: CONTRACT_ADDRESS }],
      USER_ADDRESS,
      executor,
      acl,
    );

    expect(result[HANDLE_HEX]).toBe(100n);
    expect(acl.checkUserAllowedForDecryption).toHaveBeenCalledTimes(1);
  });

  it('throws when user address lacks permission', async () => {
    const executor = createMockExecutor(new Map([[HANDLE_HEX, 100n]]));
    const acl = createMockACL({
      persistAllowed: (_handle, address) => address !== USER_ADDRESS,
    });

    const err = await cleartextUserDecrypt(
      [{ handle: HANDLE_HEX, contractAddress: CONTRACT_ADDRESS }],
      USER_ADDRESS,
      executor,
      acl,
    ).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toContain(USER_ADDRESS);
    expect(executor.getPlaintexts).not.toHaveBeenCalled();
  });

  it('throws when contract address lacks permission', async () => {
    const executor = createMockExecutor(new Map([[HANDLE_HEX, 100n]]));
    const acl = createMockACL({
      persistAllowed: (_handle, address) => address !== CONTRACT_ADDRESS,
    });

    const err = await cleartextUserDecrypt(
      [{ handle: HANDLE_HEX, contractAddress: CONTRACT_ADDRESS }],
      USER_ADDRESS,
      executor,
      acl,
    ).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toContain(CONTRACT_ADDRESS);
    expect(executor.getPlaintexts).not.toHaveBeenCalled();
  });
});
