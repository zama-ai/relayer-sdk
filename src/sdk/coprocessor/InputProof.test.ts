import type {
  Bytes32,
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
} from '../../types/primitives';
import { InputProof } from './InputProof';
import { RelayerTooManyHandlesError } from '../../errors/RelayerTooManyHandlesError';
import { RelayerInvalidProofError } from '../../errors/RelayerInvalidProofError';
import { InvalidTypeError } from '../../errors/InvalidTypeError';
import { hexToBytes } from '../../utils/bytes';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/sdk/coprocessor/InputProof.test.ts
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Test Constants
////////////////////////////////////////////////////////////////////////////////

// Valid Bytes32Hex (64 hex chars + 0x prefix = 66 chars)
const VALID_HANDLE_1 =
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as Bytes32Hex;
const VALID_HANDLE_2 =
  '0x1234567812345678123456781234567812345678123456781234567812345678' as Bytes32Hex;

// Valid Bytes65Hex (130 hex chars + 0x prefix = 132 chars)
const VALID_SIGNATURE_1 = ('0x' + 'ab'.repeat(65)) as Bytes65Hex;
const VALID_SIGNATURE_2 = ('0x' + 'cd'.repeat(65)) as Bytes65Hex;

// Valid extra data
const VALID_EXTRA_DATA = '0xdeadbeef' as BytesHex;
const EMPTY_EXTRA_DATA = '0x' as BytesHex;

////////////////////////////////////////////////////////////////////////////////

describe('InputProof', () => {
  //////////////////////////////////////////////////////////////////////////////
  // InputProof.from - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('from', () => {
    it('creates InputProof with single handle and signature', () => {
      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1],
        handles: [VALID_HANDLE_1],
        extraData: VALID_EXTRA_DATA,
      });

      expect(inputProof).toBeInstanceOf(InputProof);
      expect(inputProof.handles).toEqual([VALID_HANDLE_1]);
      expect(inputProof.signatures).toEqual([VALID_SIGNATURE_1]);
      expect(inputProof.extraData).toBe(VALID_EXTRA_DATA);
    });

    it('creates InputProof with multiple handles and signatures', () => {
      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1, VALID_SIGNATURE_2],
        handles: [VALID_HANDLE_1, VALID_HANDLE_2],
        extraData: VALID_EXTRA_DATA,
      });

      expect(inputProof.handles).toHaveLength(2);
      expect(inputProof.signatures).toHaveLength(2);
      expect(inputProof.handles).toEqual([VALID_HANDLE_1, VALID_HANDLE_2]);
      expect(inputProof.signatures).toEqual([
        VALID_SIGNATURE_1,
        VALID_SIGNATURE_2,
      ]);
    });

    it('creates InputProof with empty extra data', () => {
      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1],
        handles: [VALID_HANDLE_1],
        extraData: EMPTY_EXTRA_DATA,
      });

      expect(inputProof.extraData).toBe(EMPTY_EXTRA_DATA);
    });

    it('creates InputProof with Bytes32 Uint8Array handles', () => {
      const handleBytes: Bytes32 = new Uint8Array(32).fill(
        0xde,
      ) as unknown as Bytes32;

      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1],
        handles: [handleBytes],
        extraData: VALID_EXTRA_DATA,
      });

      expect(inputProof.handles).toHaveLength(1);
      expect(inputProof.handles[0]).toBe('0x' + 'de'.repeat(32));
    });

    it('creates InputProof with multiple Bytes32 handles', () => {
      const handleBytes1: Bytes32 = new Uint8Array(32).fill(
        0xab,
      ) as unknown as Bytes32;
      const handleBytes2: Bytes32 = new Uint8Array(32).fill(
        0xcd,
      ) as unknown as Bytes32;

      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1, VALID_SIGNATURE_2],
        handles: [handleBytes1, handleBytes2],
        extraData: VALID_EXTRA_DATA,
      });

      expect(inputProof.handles).toHaveLength(2);
      expect(inputProof.handles[0]).toBe('0x' + 'ab'.repeat(32));
      expect(inputProof.handles[1]).toBe('0x' + 'cd'.repeat(32));
    });

    it('accepts empty handles and signatures arrays', () => {
      const inputProof = InputProof.from({
        signatures: [],
        handles: [],
        extraData: VALID_EXTRA_DATA,
      });

      expect(inputProof.handles).toEqual([]);
      expect(inputProof.signatures).toEqual([]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // InputProof.from - proof format
  //////////////////////////////////////////////////////////////////////////////

  describe('from proof format', () => {
    it('generates correct proof format with single handle and signature', () => {
      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1],
        handles: [VALID_HANDLE_1],
        extraData: VALID_EXTRA_DATA,
      });

      const proof = inputProof.proof;

      // Proof format: <numHandles:1byte><numSignatures:1byte><handles><signatures><extraData>
      expect(proof.startsWith('0x')).toBe(true);

      // First byte: number of handles (1)
      expect(proof.slice(2, 4)).toBe('01');

      // Second byte: number of signatures (1)
      expect(proof.slice(4, 6)).toBe('01');

      // Handle starts at byte 2 (offset 6 in hex string)
      const handleInProof = '0x' + proof.slice(6, 6 + 64);
      expect(handleInProof).toBe(VALID_HANDLE_1);

      // Signature starts after handle (offset 6 + 64 = 70)
      const signatureInProof = '0x' + proof.slice(70, 70 + 130);
      expect(signatureInProof).toBe(VALID_SIGNATURE_1);

      // Extra data is at the end
      const extraDataInProof = '0x' + proof.slice(70 + 130);
      expect(extraDataInProof).toBe(VALID_EXTRA_DATA);
    });

    it('generates correct proof size', () => {
      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1, VALID_SIGNATURE_2],
        handles: [VALID_HANDLE_1, VALID_HANDLE_2],
        extraData: VALID_EXTRA_DATA,
      });

      const proof = inputProof.proof;
      // Size: 2 (header) + 2*32 (handles) + 2*65 (signatures) + 4 (extra data) = 200 bytes
      // Hex string: 0x + 200*2 = 402 chars
      const expectedSize = 2 + 2 * 32 + 2 * 65 + 4;
      expect(proof.length).toBe(2 + expectedSize * 2);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // InputProof.from - validation errors
  //////////////////////////////////////////////////////////////////////////////

  describe('from validation', () => {
    it('throws RelayerTooManyHandlesError for more than 255 handles', () => {
      const manyHandles = Array(256).fill(VALID_HANDLE_1) as Bytes32Hex[];

      expect(() =>
        InputProof.from({
          signatures: [VALID_SIGNATURE_1],
          handles: manyHandles,
          extraData: VALID_EXTRA_DATA,
        }),
      ).toThrow(RelayerTooManyHandlesError);
    });

    it('allows exactly 255 handles', () => {
      const maxHandles = Array(255).fill(VALID_HANDLE_1) as Bytes32Hex[];
      const maxSignatures = Array(255).fill(VALID_SIGNATURE_1) as Bytes65Hex[];

      const inputProof = InputProof.from({
        signatures: maxSignatures,
        handles: maxHandles,
        extraData: VALID_EXTRA_DATA,
      });

      expect(inputProof.handles).toHaveLength(255);
    });

    it('throws for invalid signature format', () => {
      expect(() =>
        InputProof.from({
          signatures: ['0xinvalid' as Bytes65Hex],
          handles: [VALID_HANDLE_1],
          extraData: VALID_EXTRA_DATA,
        }),
      ).toThrow(InvalidTypeError);
    });

    it('throws for invalid handle format', () => {
      expect(() =>
        InputProof.from({
          signatures: [VALID_SIGNATURE_1],
          handles: ['0xinvalid' as Bytes32Hex],
          extraData: VALID_EXTRA_DATA,
        }),
      ).toThrow(InvalidTypeError);
    });

    it('throws for invalid extra data format', () => {
      expect(() =>
        InputProof.from({
          signatures: [VALID_SIGNATURE_1],
          handles: [VALID_HANDLE_1],
          extraData: 'invalid' as BytesHex,
        }),
      ).toThrow(InvalidTypeError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // InputProof.fromProofBytes
  //////////////////////////////////////////////////////////////////////////////

  describe('fromProofBytes', () => {
    it('parses proof bytes created by from()', () => {
      const original = InputProof.from({
        signatures: [VALID_SIGNATURE_1],
        handles: [VALID_HANDLE_1],
        extraData: VALID_EXTRA_DATA,
      });

      const proofBytes = hexToBytes(original.proof);
      const parsed = InputProof.fromProofBytes(proofBytes);

      expect(parsed.handles).toEqual(original.handles);
      expect(parsed.signatures).toEqual(original.signatures);
      expect(parsed.extraData).toBe(original.extraData);
      expect(parsed.proof).toBe(original.proof);
    });

    it('parses proof with multiple handles and signatures', () => {
      const original = InputProof.from({
        signatures: [VALID_SIGNATURE_1, VALID_SIGNATURE_2],
        handles: [VALID_HANDLE_1, VALID_HANDLE_2],
        extraData: VALID_EXTRA_DATA,
      });

      const proofBytes = hexToBytes(original.proof);
      const parsed = InputProof.fromProofBytes(proofBytes);

      expect(parsed.handles).toEqual(original.handles);
      expect(parsed.signatures).toEqual(original.signatures);
    });

    it('parses proof with empty extra data', () => {
      const original = InputProof.from({
        signatures: [VALID_SIGNATURE_1],
        handles: [VALID_HANDLE_1],
        extraData: EMPTY_EXTRA_DATA,
      });

      const proofBytes = hexToBytes(original.proof);
      const parsed = InputProof.fromProofBytes(proofBytes);

      expect(parsed.extraData).toBe(EMPTY_EXTRA_DATA);
    });

    it('parses proof with no handles or signatures', () => {
      const original = InputProof.from({
        signatures: [],
        handles: [],
        extraData: VALID_EXTRA_DATA,
      });

      const proofBytes = hexToBytes(original.proof);
      const parsed = InputProof.fromProofBytes(proofBytes);

      expect(parsed.handles).toEqual([]);
      expect(parsed.signatures).toEqual([]);
      expect(parsed.extraData).toBe(VALID_EXTRA_DATA);
    });

    it('throws RelayerInvalidProofError for proof too short (< 2 bytes)', () => {
      expect(() => InputProof.fromProofBytes(new Uint8Array([]))).toThrow(
        RelayerInvalidProofError,
      );

      expect(() => InputProof.fromProofBytes(new Uint8Array([0x01]))).toThrow(
        RelayerInvalidProofError,
      );
    });

    it('throws RelayerInvalidProofError when proof is too short for declared handles', () => {
      // Header says 1 handle, but no handle data present
      const invalidProof = new Uint8Array([0x01, 0x00]); // 1 handle, 0 signatures, no data

      expect(() => InputProof.fromProofBytes(invalidProof)).toThrow(
        RelayerInvalidProofError,
      );
    });

    it('throws RelayerInvalidProofError when proof is too short for declared signatures', () => {
      // Header says 0 handles, 1 signature, but no signature data
      const invalidProof = new Uint8Array([0x00, 0x01]); // 0 handles, 1 signature, no data

      expect(() => InputProof.fromProofBytes(invalidProof)).toThrow(
        RelayerInvalidProofError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    let inputProof: InputProof;

    beforeEach(() => {
      inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1, VALID_SIGNATURE_2],
        handles: [VALID_HANDLE_1, VALID_HANDLE_2],
        extraData: VALID_EXTRA_DATA,
      });
    });

    it('proof returns BytesHex string', () => {
      expect(typeof inputProof.proof).toBe('string');
      expect(inputProof.proof.startsWith('0x')).toBe(true);
    });

    it('handles returns Bytes32Hex array', () => {
      expect(Array.isArray(inputProof.handles)).toBe(true);
      expect(inputProof.handles).toEqual([VALID_HANDLE_1, VALID_HANDLE_2]);
    });

    it('signatures returns Bytes65Hex array', () => {
      expect(Array.isArray(inputProof.signatures)).toBe(true);
      expect(inputProof.signatures).toEqual([
        VALID_SIGNATURE_1,
        VALID_SIGNATURE_2,
      ]);
    });

    it('extraData returns BytesHex string', () => {
      expect(typeof inputProof.extraData).toBe('string');
      expect(inputProof.extraData).toBe(VALID_EXTRA_DATA);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    it('handles array is frozen', () => {
      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1],
        handles: [VALID_HANDLE_1],
        extraData: VALID_EXTRA_DATA,
      });

      expect(Object.isFrozen(inputProof.handles)).toBe(true);
    });

    it('signatures array is frozen', () => {
      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1],
        handles: [VALID_HANDLE_1],
        extraData: VALID_EXTRA_DATA,
      });

      expect(Object.isFrozen(inputProof.signatures)).toBe(true);
    });

    it('modifying original handles array does not affect InputProof', () => {
      const handles: Bytes32Hex[] = [VALID_HANDLE_1];

      const inputProof = InputProof.from({
        signatures: [VALID_SIGNATURE_1],
        handles,
        extraData: VALID_EXTRA_DATA,
      });

      handles.push(VALID_HANDLE_2);

      expect(inputProof.handles).toEqual([VALID_HANDLE_1]);
    });

    it('modifying original signatures array does not affect InputProof', () => {
      const signatures: Bytes65Hex[] = [VALID_SIGNATURE_1];

      const inputProof = InputProof.from({
        signatures,
        handles: [VALID_HANDLE_1],
        extraData: VALID_EXTRA_DATA,
      });

      signatures.push(VALID_SIGNATURE_2);

      expect(inputProof.signatures).toEqual([VALID_SIGNATURE_1]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Round-trip
  //////////////////////////////////////////////////////////////////////////////

  describe('round-trip', () => {
    it('from() and fromProofBytes() produce identical results', () => {
      const testCases = [
        {
          signatures: [VALID_SIGNATURE_1],
          handles: [VALID_HANDLE_1],
          extraData: VALID_EXTRA_DATA,
        },
        {
          signatures: [VALID_SIGNATURE_1, VALID_SIGNATURE_2],
          handles: [VALID_HANDLE_1, VALID_HANDLE_2],
          extraData: VALID_EXTRA_DATA,
        },
        {
          signatures: [],
          handles: [],
          extraData: VALID_EXTRA_DATA,
        },
        {
          signatures: [VALID_SIGNATURE_1],
          handles: [VALID_HANDLE_1],
          extraData: EMPTY_EXTRA_DATA,
        },
      ];

      for (const testCase of testCases) {
        const original = InputProof.from(testCase);
        const proofBytes = hexToBytes(original.proof);
        const parsed = InputProof.fromProofBytes(proofBytes);

        expect(parsed.proof).toBe(original.proof);
        expect(parsed.handles).toEqual(original.handles);
        expect(parsed.signatures).toEqual(original.signatures);
        expect(parsed.extraData).toBe(original.extraData);
      }
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Real payload data (from input-proof-payload-1.json)
  //////////////////////////////////////////////////////////////////////////////

  describe('real payload data', () => {
    // Data from src/test/assets/input-proof-payload-1.json
    const PAYLOAD_HANDLE =
      '0x20244f826737772a0b7f1254c1cc982d83094d65ec000000000000aa36a70400' as Bytes32Hex;
    const PAYLOAD_SIGNATURE =
      '0x99371b00876f64a0ff5600cf92cddb7ca17838eff40f3d90759170b99210a8d60d504ab659b7be291d9725228facb93786faa5d573481172927029958e990f691c' as Bytes65Hex;
    const PAYLOAD_EXTRA_DATA = '0xabcdef' as BytesHex;

    it('creates InputProof from real payload handles and signatures', () => {
      const inputProof = InputProof.from({
        signatures: [PAYLOAD_SIGNATURE],
        handles: [PAYLOAD_HANDLE],
        extraData: PAYLOAD_EXTRA_DATA,
      });

      expect(inputProof).toBeInstanceOf(InputProof);
      expect(inputProof.handles).toEqual([PAYLOAD_HANDLE]);
      expect(inputProof.signatures).toEqual([PAYLOAD_SIGNATURE]);
      expect(inputProof.extraData).toBe(PAYLOAD_EXTRA_DATA);
    });

    it('round-trips real payload data through from() and fromProofBytes()', () => {
      const original = InputProof.from({
        signatures: [PAYLOAD_SIGNATURE],
        handles: [PAYLOAD_HANDLE],
        extraData: PAYLOAD_EXTRA_DATA,
      });

      const proofBytes = hexToBytes(original.proof);
      const parsed = InputProof.fromProofBytes(proofBytes);

      expect(parsed.proof).toBe(original.proof);
      expect(parsed.handles).toEqual([PAYLOAD_HANDLE]);
      expect(parsed.signatures).toEqual([PAYLOAD_SIGNATURE]);
      expect(parsed.extraData).toBe(PAYLOAD_EXTRA_DATA);
    });

    it('generates correct proof structure with real payload data', () => {
      const inputProof = InputProof.from({
        signatures: [PAYLOAD_SIGNATURE],
        handles: [PAYLOAD_HANDLE],
        extraData: PAYLOAD_EXTRA_DATA,
      });

      const proof = inputProof.proof;

      // Verify header bytes
      expect(proof.slice(2, 4)).toBe('01'); // 1 handle
      expect(proof.slice(4, 6)).toBe('01'); // 1 signature

      // Verify handle is present (after 2-byte header)
      const handleInProof = '0x' + proof.slice(6, 6 + 64);
      expect(handleInProof).toBe(PAYLOAD_HANDLE);

      // Verify signature is present (after header + handle)
      const signatureInProof = '0x' + proof.slice(70, 70 + 130);
      expect(signatureInProof).toBe(PAYLOAD_SIGNATURE);

      // Verify extra data at the end
      const extraDataInProof = '0x' + proof.slice(200);
      expect(extraDataInProof).toBe(PAYLOAD_EXTRA_DATA);
    });
  });
});
