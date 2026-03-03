import type { ChecksummedAddress } from '../../base/types/primitives';
import { KmsContextCache } from './KmsContextCache';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/kms/KmsContextCache.test.ts
//
////////////////////////////////////////////////////////////////////////////////

// Mock only ethers.Contract, preserving the rest of ethers (needed by isChecksummedAddress etc.)
const mockGetSignersForKmsContext = jest.fn();
const mockGetCurrentKmsContextId = jest.fn();

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    Contract: jest.fn().mockImplementation(() => ({
      getSignersForKmsContext: mockGetSignersForKmsContext,
      getCurrentKmsContextId: mockGetCurrentKmsContextId,
    })),
  };
});

const VALID_KMS_ADDRESS =
  '0x208De73316E44722e16f6dDFF40881A3e4F86104' as ChecksummedAddress;
const VALID_SIGNER_1 =
  '0x37AC010c1c566696326813b840319B58Bb5840E4' as ChecksummedAddress;
const VALID_SIGNER_2 =
  '0x9aF5773d8dC3d9A57c92e08EF024804eC39FD3b3' as ChecksummedAddress;

function createCache(contextIdTtlMs?: number): KmsContextCache {
  return KmsContextCache.create({
    kmsContractAddress: VALID_KMS_ADDRESS,
    provider: {} as any,
    contextIdTtlMs,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('KmsContextCache', () => {
  describe('getSignersForContext', () => {
    it('returns signers from contract on cache miss', async () => {
      mockGetSignersForKmsContext.mockResolvedValue([
        VALID_SIGNER_1,
        VALID_SIGNER_2,
      ]);

      const cache = createCache();
      const signers = await cache.getSignersForContext(1n);

      expect(signers).toEqual([VALID_SIGNER_1, VALID_SIGNER_2]);
      expect(mockGetSignersForKmsContext).toHaveBeenCalledWith(1n);
      expect(mockGetSignersForKmsContext).toHaveBeenCalledTimes(1);
    });

    it('returns cached signers without calling contract again (cache hit)', async () => {
      mockGetSignersForKmsContext.mockResolvedValue([VALID_SIGNER_1]);

      const cache = createCache();
      const signers1 = await cache.getSignersForContext(1n);
      const signers2 = await cache.getSignersForContext(1n);

      expect(signers1).toBe(signers2); // same reference
      expect(mockGetSignersForKmsContext).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent calls for same context ID', async () => {
      mockGetSignersForKmsContext.mockResolvedValue([VALID_SIGNER_1]);

      const cache = createCache();
      const [result1, result2] = await Promise.all([
        cache.getSignersForContext(1n),
        cache.getSignersForContext(1n),
      ]);

      expect(result1).toBe(result2);
      expect(mockGetSignersForKmsContext).toHaveBeenCalledTimes(1);
    });

    it('evicts rejected promise — subsequent call retries', async () => {
      const rpcError = new Error('RPC failure');
      mockGetSignersForKmsContext.mockRejectedValueOnce(rpcError);
      mockGetSignersForKmsContext.mockResolvedValueOnce([VALID_SIGNER_1]);

      const cache = createCache();

      await expect(cache.getSignersForContext(1n)).rejects.toThrow(
        'Failed to fetch signers for KMS context 1',
      );

      const signers = await cache.getSignersForContext(1n);
      expect(signers).toEqual([VALID_SIGNER_1]);
      expect(mockGetSignersForKmsContext).toHaveBeenCalledTimes(2);
    });

    it('rejects non-checksummed addresses', async () => {
      // lowercase address is not checksummed
      mockGetSignersForKmsContext.mockResolvedValue([
        '0x37ac010c1c566696326813b840319b58bb5840e4',
      ]);

      const cache = createCache();
      await expect(cache.getSignersForContext(1n)).rejects.toThrow(
        'Invalid signer addresses for KMS context 1',
      );
    });

    it('propagates RPC failure with original error as cause', async () => {
      const rpcError = new Error('connection reset');
      mockGetSignersForKmsContext.mockRejectedValue(rpcError);

      const cache = createCache();
      try {
        await cache.getSignersForContext(1n);
        fail('Expected error');
      } catch (e: any) {
        expect(e.message).toContain('Failed to fetch signers for KMS context');
        expect(e.cause).toBe(rpcError);
      }
    });

    it('caches different context IDs independently', async () => {
      mockGetSignersForKmsContext
        .mockResolvedValueOnce([VALID_SIGNER_1])
        .mockResolvedValueOnce([VALID_SIGNER_2]);

      const cache = createCache();
      const signers1 = await cache.getSignersForContext(1n);
      const signers2 = await cache.getSignersForContext(2n);

      expect(signers1).toEqual([VALID_SIGNER_1]);
      expect(signers2).toEqual([VALID_SIGNER_2]);
      expect(mockGetSignersForKmsContext).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCurrentContextId', () => {
    it('returns context ID from contract on first call', async () => {
      mockGetCurrentKmsContextId.mockResolvedValue(42n);

      const cache = createCache();
      const contextId = await cache.getCurrentContextId();

      expect(contextId).toBe(42n);
      expect(mockGetCurrentKmsContextId).toHaveBeenCalledTimes(1);
    });

    it('returns cached value on second call within TTL (no second RPC)', async () => {
      mockGetCurrentKmsContextId.mockResolvedValue(42n);

      const cache = createCache(5000);
      await cache.getCurrentContextId();
      const contextId2 = await cache.getCurrentContextId();

      expect(contextId2).toBe(42n);
      expect(mockGetCurrentKmsContextId).toHaveBeenCalledTimes(1);
    });

    it('re-fetches after TTL expires', async () => {
      jest.useFakeTimers();
      mockGetCurrentKmsContextId
        .mockResolvedValueOnce(42n)
        .mockResolvedValueOnce(43n);

      const cache = createCache(100);

      const id1 = await cache.getCurrentContextId();
      expect(id1).toBe(42n);

      // Advance past TTL
      jest.advanceTimersByTime(150);

      const id2 = await cache.getCurrentContextId();
      expect(id2).toBe(43n);
      expect(mockGetCurrentKmsContextId).toHaveBeenCalledTimes(2);
    });

    it('returns stale value on RPC failure with valid cached value', async () => {
      mockGetCurrentKmsContextId
        .mockResolvedValueOnce(42n)
        .mockRejectedValueOnce(new Error('RPC down'));

      const cache = createCache(0); // TTL=0 to force re-fetch

      // Populate cache
      const id1 = await cache.getCurrentContextId();
      expect(id1).toBe(42n);

      // Wait for in-flight promise to clear
      await new Promise((r) => setTimeout(r, 10));

      // Second call: RPC fails, returns stale 42n
      const id2 = await cache.getCurrentContextId();
      expect(id2).toBe(42n);
    });

    it('retries once on RPC failure with no cached value (cold start)', async () => {
      jest.useFakeTimers();
      mockGetCurrentKmsContextId
        .mockRejectedValueOnce(new Error('first fail'))
        .mockResolvedValueOnce(42n);

      const cache = createCache();

      const promise = cache.getCurrentContextId();
      // Advance past retry delay
      await jest.advanceTimersByTimeAsync(250);

      const contextId = await promise;
      expect(contextId).toBe(42n);
      expect(mockGetCurrentKmsContextId).toHaveBeenCalledTimes(2);
    });

    it('throws wrapped error on double failure (cold start)', async () => {
      const firstError = new Error('first fail');
      const secondError = new Error('second fail');
      mockGetCurrentKmsContextId
        .mockRejectedValueOnce(firstError)
        .mockRejectedValueOnce(secondError);

      const cache = createCache();

      await expect(cache.getCurrentContextId()).rejects.toThrow(
        'Failed to fetch current KMS context ID (both attempts failed)',
      );
      expect(mockGetCurrentKmsContextId).toHaveBeenCalledTimes(2);
    });

    it('deduplicates concurrent calls (single RPC + retry sequence)', async () => {
      mockGetCurrentKmsContextId.mockResolvedValue(42n);

      const cache = createCache();
      const [id1, id2, id3] = await Promise.all([
        cache.getCurrentContextId(),
        cache.getCurrentContextId(),
        cache.getCurrentContextId(),
      ]);

      expect(id1).toBe(42n);
      expect(id2).toBe(42n);
      expect(id3).toBe(42n);
      expect(mockGetCurrentKmsContextId).toHaveBeenCalledTimes(1);
    });
  });
});
