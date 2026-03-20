import { resolveEffectiveSigners } from './userDecrypt';
import { buildRequestExtraData } from '../sdk/kms/extraData';
import type { RelayerUserDecryptResult } from '../relayer-provider/types/public-api';
import type { KmsContextCache } from '../sdk/kms/KmsContextCache';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer/resolveEffectiveSigners.test.ts

const INIT_TIME_SIGNERS = [
  '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
];

const CONTEXT_SIGNERS = [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
];

function createMockKmsContextCache(
  signers: string[] = CONTEXT_SIGNERS,
): KmsContextCache {
  return {
    getSignersForContext: jest.fn().mockResolvedValue(signers),
    getCurrentContextId: jest.fn().mockResolvedValue(42n),
  } as unknown as KmsContextCache;
}

describe('resolveEffectiveSigners', () => {
  it('empty response returns init-time signers', async () => {
    const mockCache = createMockKmsContextCache();
    const result = await resolveEffectiveSigners(
      [],
      INIT_TIME_SIGNERS,
      mockCache,
    );
    expect(result).toEqual(INIT_TIME_SIGNERS);
    expect(mockCache.getSignersForContext).not.toHaveBeenCalled();
  });

  it('legacy extraData (0x00) returns init-time signers', async () => {
    const mockCache = createMockKmsContextCache();
    const json: RelayerUserDecryptResult = [
      { payload: 'deadbeef', signature: 'deadbeef', extraData: '0x00' },
    ];
    const result = await resolveEffectiveSigners(
      json,
      INIT_TIME_SIGNERS,
      mockCache,
    );
    expect(result).toEqual(INIT_TIME_SIGNERS);
    expect(mockCache.getSignersForContext).not.toHaveBeenCalled();
  });

  it('context-bearing extraData calls kmsContextCache.getSignersForContext', async () => {
    const contextId = 42n;
    const contextExtraData = buildRequestExtraData(contextId);
    const mockCache = createMockKmsContextCache();

    const json: RelayerUserDecryptResult = [
      {
        payload: 'deadbeef',
        signature: 'deadbeef',
        extraData: contextExtraData,
      },
      {
        payload: 'cafebabe',
        signature: 'cafebabe',
        extraData: contextExtraData,
      },
    ];

    const result = await resolveEffectiveSigners(
      json,
      INIT_TIME_SIGNERS,
      mockCache,
    );
    expect(result).toEqual(CONTEXT_SIGNERS);
    expect(mockCache.getSignersForContext).toHaveBeenCalledWith(contextId);
  });

  it('mixed context IDs across items throws', async () => {
    const mockCache = createMockKmsContextCache();
    const extraData1 = buildRequestExtraData(42n);
    const extraData2 = buildRequestExtraData(99n);

    const json: RelayerUserDecryptResult = [
      { payload: 'deadbeef', signature: 'deadbeef', extraData: extraData1 },
      { payload: 'cafebabe', signature: 'cafebabe', extraData: extraData2 },
    ];

    await expect(
      resolveEffectiveSigners(json, INIT_TIME_SIGNERS, mockCache),
    ).rejects.toThrow(
      'Mixed context IDs in user decrypt response are not supported',
    );
  });

  it('returns a copy of init-time signers (not same reference)', async () => {
    const mockCache = createMockKmsContextCache();
    const result = await resolveEffectiveSigners(
      [],
      INIT_TIME_SIGNERS,
      mockCache,
    );
    expect(result).not.toBe(INIT_TIME_SIGNERS);
  });
});
