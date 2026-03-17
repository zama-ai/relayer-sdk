import type { BytesHex } from '../../base/types/primitives';
import {
  isLegacyExtraData,
  parseExtraData,
  buildRequestExtraData,
} from './extraData';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/kms/extraData.test.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('extraData', () => {
  describe('isLegacyExtraData', () => {
    it('returns true for empty bytes (0x)', () => {
      expect(isLegacyExtraData('0x')).toBe(true);
    });

    it('returns true for v0 with no trailing bytes (0x00)', () => {
      expect(isLegacyExtraData('0x00')).toBe(true);
    });

    it('returns true for v0 with trailing bytes (0x00aabbcc)', () => {
      expect(isLegacyExtraData('0x00aabbcc')).toBe(true);
    });

    it('returns false for v1 extraData', () => {
      const v1ExtraData = ('0x01' + '00'.repeat(32)) as BytesHex;
      expect(isLegacyExtraData(v1ExtraData)).toBe(false);
    });

    it('returns false for unsupported version 0x02', () => {
      const v2ExtraData = ('0x02' + '00'.repeat(32)) as BytesHex;
      expect(isLegacyExtraData(v2ExtraData)).toBe(false);
    });
  });

  describe('parseExtraData', () => {
    it('parses v1 with 32-byte contextId = 0', () => {
      const extraData = ('0x01' + '00'.repeat(32)) as BytesHex;
      const result = parseExtraData(extraData);
      expect(result.version).toBe(1);
      expect(result.contextId).toBe(0n);
    });

    it('parses v1 with contextId = 1', () => {
      const extraData = ('0x01' + '00'.repeat(31) + '01') as BytesHex;
      const result = parseExtraData(extraData);
      expect(result.version).toBe(1);
      expect(result.contextId).toBe(1n);
    });

    it('parses v1 with contextId = max uint256', () => {
      const extraData = ('0x01' + 'ff'.repeat(32)) as BytesHex;
      const result = parseExtraData(extraData);
      expect(result.version).toBe(1);
      expect(result.contextId).toBe(2n ** 256n - 1n);
    });

    it('parses v1 with trailing data (forward-compat)', () => {
      const extraData = ('0x01' + '00'.repeat(31) + '05' + 'aabb') as BytesHex;
      const result = parseExtraData(extraData);
      expect(result.version).toBe(1);
      expect(result.contextId).toBe(5n);
    });

    it('throws for v1 with less than 32 bytes of contextId', () => {
      const extraData = ('0x01' + '00'.repeat(20)) as BytesHex;
      expect(() => parseExtraData(extraData)).toThrow(
        'extraData too short for v1',
      );
    });

    it('throws for unsupported version 0x02', () => {
      const extraData = ('0x02' + '00'.repeat(32)) as BytesHex;
      expect(() => parseExtraData(extraData)).toThrow(
        'Unsupported extraData version 2',
      );
    });

    it('throws for unsupported version 0xff', () => {
      const extraData = ('0xff' + '00'.repeat(32)) as BytesHex;
      expect(() => parseExtraData(extraData)).toThrow(
        'Unsupported extraData version 255',
      );
    });
  });

  describe('buildRequestExtraData', () => {
    it('builds extraData for contextId = 0', () => {
      const result = buildRequestExtraData(0n);
      expect(result).toBe('0x01' + '00'.repeat(32));
    });

    it('builds extraData for contextId = 1', () => {
      const result = buildRequestExtraData(1n);
      expect(result).toBe('0x01' + '00'.repeat(31) + '01');
    });

    it('builds extraData for contextId = max uint256', () => {
      const result = buildRequestExtraData(2n ** 256n - 1n);
      expect(result).toBe('0x01' + 'ff'.repeat(32));
    });

    it('throws for negative contextId', () => {
      expect(() => buildRequestExtraData(-1n)).toThrow(
        'contextId must be a non-negative uint256',
      );
    });

    it('throws for contextId exceeding uint256', () => {
      expect(() => buildRequestExtraData(2n ** 256n)).toThrow(
        'contextId must be a non-negative uint256',
      );
    });
  });

  describe('round-trip', () => {
    it.each([0n, 1n, 42n, 2n ** 128n, 2n ** 256n - 1n])(
      'parseExtraData(buildRequestExtraData(%s)).contextId === %s',
      (contextId) => {
        const extraData = buildRequestExtraData(contextId);
        const parsed = parseExtraData(extraData);
        expect(parsed.contextId).toBe(contextId);
      },
    );
  });
});
