import { TEST_CONFIG } from '../test/config';
import { parseRelayerUrl } from './relayerUrl';
import { removeSuffix } from '@base/string';

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
  const VALID_RELAYER_URL_V1 = TEST_CONFIG.v1.fhevmInstanceConfig.relayerUrl;
  const VALID_RELAYER_URL_V2 = TEST_CONFIG.v2.fhevmInstanceConfig.relayerUrl;
  const VALID_RELAYER_URL_BASE = removeSuffix(VALID_RELAYER_URL_V1, '/v1');

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

    it('returns null for invalid fallback version (non-Zama URL)', () => {
      expect(parseRelayerUrl('https://example.com', 0 as any)).toBeNull();
      expect(parseRelayerUrl('https://example.com', 3 as any)).toBeNull();
      expect(parseRelayerUrl('https://example.com', 'v1' as any)).toBeNull();
    });

    it('returns null for invalid fallback version (Zama base URL)', () => {
      expect(parseRelayerUrl(VALID_RELAYER_URL_BASE, 0 as any)).toBeNull();
      expect(parseRelayerUrl(VALID_RELAYER_URL_BASE, 3 as any)).toBeNull();
      expect(parseRelayerUrl(VALID_RELAYER_URL_BASE, 'v1' as any)).toBeNull();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // URL with explicit version
  //////////////////////////////////////////////////////////////////////////////

  describe('URL with explicit version', () => {
    it('returns version 1 for URL ending with /v1', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_V1, 2);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V1,
        version: 1,
      });
    });

    it('returns version 2 for URL ending with /v2', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_V2, 2);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('removes trailing slash before checking version', () => {
      const result1 = parseRelayerUrl(`${VALID_RELAYER_URL_V1}/`, 2);
      expect(result1).toStrictEqual({
        url: VALID_RELAYER_URL_V1,
        version: 1,
      });

      const result2 = parseRelayerUrl(`${VALID_RELAYER_URL_V2}/`, 1);
      expect(result2).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('explicit version overrides fallback version', () => {
      expect(parseRelayerUrl(VALID_RELAYER_URL_V1, 2)?.version).toBe(1);
      expect(parseRelayerUrl(VALID_RELAYER_URL_V2, 1)?.version).toBe(2);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // URL without version (uses fallback)
  //////////////////////////////////////////////////////////////////////////////

  describe('URL without version (uses fallback)', () => {
    it('appends fallback version 1 to URL', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_BASE, 1);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V1,
        version: 1,
      });
    });

    it('appends fallback version 2 to URL', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_BASE, 2);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('removes trailing slash before appending version', () => {
      const result = parseRelayerUrl(`${VALID_RELAYER_URL_BASE}/`, 1);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V1,
        version: 1,
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // relayerRouteVersion parameter
  //////////////////////////////////////////////////////////////////////////////

  describe('relayerRouteVersion parameter', () => {
    it('non-Zama URL uses relayerRouteVersion over fallbackVersion', () => {
      const result = parseRelayerUrl('https://custom-relayer.com', 1, 2);

      expect(result).toStrictEqual({
        url: 'https://custom-relayer.com',
        version: 2,
      });
    });

    it('non-Zama URL uses relayerRouteVersion=1', () => {
      const result = parseRelayerUrl('https://custom-relayer.com', 2, 1);

      expect(result).toStrictEqual({
        url: 'https://custom-relayer.com',
        version: 1,
      });
    });

    it('Zama base URL uses relayerRouteVersion to append version', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_BASE, 1, 2);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('Zama base URL uses relayerRouteVersion=1 to append version', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_BASE, 2, 1);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V1,
        version: 1,
      });
    });

    it('explicit URL version takes precedence over relayerRouteVersion', () => {
      // URL has /v1, relayerRouteVersion is 2 - URL wins
      const result1 = parseRelayerUrl(VALID_RELAYER_URL_V1, 2, 2);
      expect(result1).toStrictEqual({
        url: VALID_RELAYER_URL_V1,
        version: 1,
      });

      // URL has /v2, relayerRouteVersion is 1 - URL wins
      const result2 = parseRelayerUrl(VALID_RELAYER_URL_V2, 1, 1);
      expect(result2).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('undefined relayerRouteVersion falls back to fallbackVersion', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_BASE, 2, undefined);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
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
        url: 'https://localhost:8080',
        version: 1,
      });
    });

    it('handles URL with port and explicit version', () => {
      const result = parseRelayerUrl('https://localhost:8080/v2', 1);

      expect(result).toStrictEqual({
        url: 'https://localhost:8080/v2',
        version: 1,
      });
    });

    it('handles http URL', () => {
      const result = parseRelayerUrl('http://relayer.local/v1', 2);

      expect(result).toStrictEqual({
        url: 'http://relayer.local/v1',
        version: 2,
      });
    });

    it('does not match v1/v2 in the middle of path', () => {
      let result = parseRelayerUrl('https://example.com/v1/api', 2);

      expect(result).toStrictEqual({
        url: 'https://example.com/v1/api',
        version: 2,
      });

      result = parseRelayerUrl('https://example.com.v1', 2);

      expect(result).toStrictEqual({
        url: 'https://example.com.v1',
        version: 2,
      });
    });

    it('handles URL with query params (unusual but valid)', () => {
      const result = parseRelayerUrl('https://example.com?foo=bar', 1);

      expect(result).toStrictEqual({
        url: 'https://example.com?foo=bar',
        version: 1,
      });
    });

    it('handles URL with query params ending with v1 (unusual but valid)', () => {
      const result = parseRelayerUrl('https://example.com?foo=barv1', 2);

      expect(result).toStrictEqual({
        url: 'https://example.com?foo=barv1',
        version: 2,
      });
    });
  });
});
