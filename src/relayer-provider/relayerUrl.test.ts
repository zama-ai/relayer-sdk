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
      expect(parseRelayerUrl(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(parseRelayerUrl(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseRelayerUrl('')).toBeNull();
    });

    it('returns null for non-string input', () => {
      expect(parseRelayerUrl(123)).toBeNull();
      expect(parseRelayerUrl({})).toBeNull();
      expect(parseRelayerUrl([])).toBeNull();
    });

    it('returns null for invalid URL', () => {
      expect(parseRelayerUrl('not-a-url')).toBeNull();
      expect(parseRelayerUrl('://missing-protocol')).toBeNull();
    });

    it('always returns v2 for non-Zama URLs', () => {
      expect(parseRelayerUrl('https://example.com')).toStrictEqual({
        url: 'https://example.com',
        version: 2,
      });
    });

    it('ignores invalid fallback version for Zama base URL (always returns v2)', () => {
      expect(parseRelayerUrl(VALID_RELAYER_URL_BASE)).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Zama URLs with version suffix
  //////////////////////////////////////////////////////////////////////////////

  describe('Zama URLs with version suffix', () => {
    it('upgrades Zama v1 URL to v2', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_V1);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('returns Zama v2 URL unchanged', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_V2);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('removes trailing slash from Zama URL before processing', () => {
      const result1 = parseRelayerUrl(`${VALID_RELAYER_URL_V1}/`);
      expect(result1).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });

      const result2 = parseRelayerUrl(`${VALID_RELAYER_URL_V2}/`);
      expect(result2).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('Zama URLs ignore fallbackVersion (always return v2)', () => {
      expect(parseRelayerUrl(VALID_RELAYER_URL_V1)?.version).toBe(2);
      expect(parseRelayerUrl(VALID_RELAYER_URL_V2)?.version).toBe(2);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Zama base URL (no version suffix)
  //////////////////////////////////////////////////////////////////////////////

  describe('Zama base URL (no version suffix)', () => {
    it('appends /v2 to Zama base URL (ignores fallback v1)', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_BASE);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('appends /v2 to Zama base URL (ignores fallback v2)', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_BASE);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('removes trailing slash from Zama base URL before appending /v2', () => {
      const result = parseRelayerUrl(`${VALID_RELAYER_URL_BASE}/`);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Always returns version 2
  //////////////////////////////////////////////////////////////////////////////

  describe('always returns version 2', () => {
    it('returns non-Zama URL as-is with version 2', () => {
      const result = parseRelayerUrl('https://custom-relayer.com');

      expect(result).toStrictEqual({
        url: 'https://custom-relayer.com',
        version: 2,
      });
    });

    it('Zama base URL appends /v2 and returns version 2', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_BASE);

      expect(result).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('Zama v1 URL is upgraded to v2; Zama v2 URL is returned unchanged', () => {
      const result1 = parseRelayerUrl(VALID_RELAYER_URL_V1);
      expect(result1).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });

      const result2 = parseRelayerUrl(VALID_RELAYER_URL_V2);
      expect(result2).toStrictEqual({
        url: VALID_RELAYER_URL_V2,
        version: 2,
      });
    });

    it('Zama base URL defaults to version 2', () => {
      const result = parseRelayerUrl(VALID_RELAYER_URL_BASE);

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
      const result = parseRelayerUrl('https://localhost:8080');

      expect(result).toStrictEqual({
        url: 'https://localhost:8080',
        version: 2,
      });
    });

    it('non-Zama URL: /v2 in path does not affect version (uses fallbackVersion)', () => {
      const result = parseRelayerUrl('https://localhost:8080/v2');

      expect(result).toStrictEqual({
        url: 'https://localhost:8080/v2',
        version: 2,
      });
    });

    it('non-Zama http URL: /v1 in path does not affect version (uses fallbackVersion)', () => {
      const result = parseRelayerUrl('http://relayer.local/v1');

      expect(result).toStrictEqual({
        url: 'http://relayer.local/v1',
        version: 2,
      });
    });

    it('does not match v1/v2 in the middle of path', () => {
      let result = parseRelayerUrl('https://example.com/v1/api');

      expect(result).toStrictEqual({
        url: 'https://example.com/v1/api',
        version: 2,
      });

      result = parseRelayerUrl('https://example.com.v1');

      expect(result).toStrictEqual({
        url: 'https://example.com.v1',
        version: 2,
      });
    });

    it('handles URL with query params (unusual but valid)', () => {
      const result = parseRelayerUrl('https://example.com?foo=bar');

      expect(result).toStrictEqual({
        url: 'https://example.com?foo=bar',
        version: 2,
      });
    });

    it('handles URL with query params ending with v1 (unusual but valid)', () => {
      const result = parseRelayerUrl('https://example.com?foo=barv1');

      expect(result).toStrictEqual({
        url: 'https://example.com?foo=barv1',
        version: 2,
      });
    });
  });
});
