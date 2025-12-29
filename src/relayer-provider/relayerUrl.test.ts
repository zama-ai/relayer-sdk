import { parseRelayerUrl } from './relayerUrl';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer-provider/relayerUrl.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/relayerUrl.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/relayerUrl.test.ts --collectCoverageFrom=./src/relayer-provider/relayerUrl.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('parseRelayerUrl', () => {
  //////////////////////////////////////////////////////////////////////////////
  // Invalid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid inputs', () => {
    it('returns null for null input', () => {
      expect(parseRelayerUrl(null, 1)).toBeNull();
      expect(parseRelayerUrl(null, 2)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(parseRelayerUrl(undefined, 1)).toBeNull();
      expect(parseRelayerUrl(undefined, 2)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseRelayerUrl('', 1)).toBeNull();
      expect(parseRelayerUrl('', 2)).toBeNull();
    });

    it('returns null for non-string input', () => {
      expect(parseRelayerUrl(123, 1)).toBeNull();
      expect(parseRelayerUrl({}, 1)).toBeNull();
      expect(parseRelayerUrl([], 1)).toBeNull();
    });

    it('returns null for invalid URL', () => {
      expect(parseRelayerUrl('not-a-url', 1)).toBeNull();
      expect(parseRelayerUrl('://missing-protocol', 1)).toBeNull();
    });

    it('returns null for invalid fallback version', () => {
      expect(parseRelayerUrl('https://example.com', 0 as any)).toBeNull();
      expect(parseRelayerUrl('https://example.com', 3 as any)).toBeNull();
      expect(parseRelayerUrl('https://example.com', 'v1' as any)).toBeNull();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // URL with explicit version
  //////////////////////////////////////////////////////////////////////////////

  describe('URL with explicit version', () => {
    it('returns version 1 for URL ending with /v1', () => {
      const result = parseRelayerUrl('https://relayer.example.com/v1', 2);

      expect(result).toStrictEqual({
        url: 'https://relayer.example.com/v1',
        version: 1,
      });
    });

    it('returns version 2 for URL ending with /v2', () => {
      const result = parseRelayerUrl('https://relayer.example.com/v2', 1);

      expect(result).toStrictEqual({
        url: 'https://relayer.example.com/v2',
        version: 2,
      });
    });

    it('removes trailing slash before checking version', () => {
      const result1 = parseRelayerUrl('https://relayer.example.com/v1/', 2);
      expect(result1).toStrictEqual({
        url: 'https://relayer.example.com/v1',
        version: 1,
      });

      const result2 = parseRelayerUrl('https://relayer.example.com/v2/', 1);
      expect(result2).toStrictEqual({
        url: 'https://relayer.example.com/v2',
        version: 2,
      });
    });

    it('explicit version overrides fallback version', () => {
      expect(parseRelayerUrl('https://example.com/v1', 2)?.version).toBe(1);
      expect(parseRelayerUrl('https://example.com/v2', 1)?.version).toBe(2);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // URL without version (uses fallback)
  //////////////////////////////////////////////////////////////////////////////

  describe('URL without version (uses fallback)', () => {
    it('appends fallback version 1 to URL', () => {
      const result = parseRelayerUrl('https://relayer.example.com', 1);

      expect(result).toStrictEqual({
        url: 'https://relayer.example.com/v1',
        version: 1,
      });
    });

    it('appends fallback version 2 to URL', () => {
      const result = parseRelayerUrl('https://relayer.example.com', 2);

      expect(result).toStrictEqual({
        url: 'https://relayer.example.com/v2',
        version: 2,
      });
    });

    it('removes trailing slash before appending version', () => {
      const result = parseRelayerUrl('https://relayer.example.com/', 1);

      expect(result).toStrictEqual({
        url: 'https://relayer.example.com/v1',
        version: 1,
      });
    });

    it('handles URL with path before appending version', () => {
      const result = parseRelayerUrl('https://relayer.example.com/api', 2);

      expect(result).toStrictEqual({
        url: 'https://relayer.example.com/api/v2',
        version: 2,
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Edge cases
  //////////////////////////////////////////////////////////////////////////////

  describe('edge cases', () => {
    it('handles URL with port', () => {
      const result = parseRelayerUrl('https://localhost:8080', 1);

      expect(result).toStrictEqual({
        url: 'https://localhost:8080/v1',
        version: 1,
      });
    });

    it('handles URL with port and explicit version', () => {
      const result = parseRelayerUrl('https://localhost:8080/v2', 1);

      expect(result).toStrictEqual({
        url: 'https://localhost:8080/v2',
        version: 2,
      });
    });

    it('handles http URL', () => {
      const result = parseRelayerUrl('http://relayer.local/v1', 2);

      expect(result).toStrictEqual({
        url: 'http://relayer.local/v1',
        version: 1,
      });
    });

    it('does not match v1/v2 in the middle of path', () => {
      let result = parseRelayerUrl('https://example.com/v1/api', 2);

      expect(result).toStrictEqual({
        url: 'https://example.com/v1/api/v2',
        version: 2,
      });

      result = parseRelayerUrl('https://example.com.v1', 2);

      expect(result).toStrictEqual({
        url: 'https://example.com.v1/v2',
        version: 2,
      });
    });

    it('handles URL with query params (unusual but valid)', () => {
      const result = parseRelayerUrl('https://example.com?foo=bar', 1);

      expect(result).toStrictEqual({
        url: 'https://example.com?foo=bar/v1',
        version: 1,
      });
    });

    it('handles URL with query params ending with v1 (unusual but valid)', () => {
      const result = parseRelayerUrl('https://example.com?foo=barv1', 2);

      expect(result).toStrictEqual({
        url: 'https://example.com?foo=barv1/v2',
        version: 2,
      });
    });
  });
});
