import { EncryptionError } from '../../errors/EncryptionError';
import { pkeParams as pkeParamsAsset } from '../../test';
import { TEST_CONFIG } from '../../test/config';
import { ChecksummedAddress } from '../../types/primitives';
import { TFHEZKProofBuilder } from './TFHEZKProofBuilder';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TFHEZKProofBuilder.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TFHEZKProofBuilder.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/lowlevel/TFHEZKProofBuilder.test.ts --collectCoverageFrom=./src/sdk/lowlevel/TFHEZKProofBuilder.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////

const aclContractAddress =
  '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8' as ChecksummedAddress;
const chainId = 1234;
const contractAddress =
  '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80' as ChecksummedAddress;
const userAddress =
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72' as ChecksummedAddress;

////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('TFHEZKProofBuilder', () => {
  it('encrypt', async () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });
    builder.addBool(false);
    builder.addUint8(43n);
    builder.addUint16(87n);
    builder.addUint32(2339389323n);
    builder.addUint64(23393893233n);
    builder.addUint128(233938932390n);
    builder.addAddress('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80');
    builder.addUint256(2339389323922393930n);
    const ciphertext = builder.generateZKProof({
      aclContractAddress,
      chainId,
      contractAddress,
      userAddress,
    });
    expect(ciphertext.ciphertextWithZKProof.length).toBe(20106);
  }, 60000);

  it('encrypt one 0 value', async () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });
    builder.addUint128(BigInt(0));
    const ciphertext = builder.generateZKProof({
      aclContractAddress,
      chainId,
      contractAddress,
      userAddress,
    });
    expect(ciphertext.ciphertextWithZKProof.length).toBe(18922);
  });

  it('throws errors', async () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });
    builder.addUint128(BigInt(0));

    const invalidAddress = '0x0';
    const invalidChecksummedAddress = '0x8ba1f109551bd432803012645ac136ddd64d';

    /// Invalid User Address
    expect(() =>
      builder.generateZKProof({
        aclContractAddress,
        chainId,
        contractAddress,
        userAddress: invalidAddress,
      }),
    ).toThrow(
      new EncryptionError({
        message: `Invalid user checksummed address: ${invalidAddress}`,
      }),
    );

    /// Invalid User Checksummed Address
    expect(() =>
      builder.generateZKProof({
        aclContractAddress,
        chainId,
        contractAddress,
        userAddress: invalidChecksummedAddress,
      }),
    ).toThrow(
      new EncryptionError({
        message: `Invalid user checksummed address: ${invalidChecksummedAddress}`,
      }),
    );

    /// Invalid Contract Address
    expect(() =>
      builder.generateZKProof({
        aclContractAddress,
        chainId,
        contractAddress: invalidAddress,
        userAddress,
      }),
    ).toThrow(
      new EncryptionError({
        message: `Invalid contract checksummed address: ${invalidAddress}`,
      }),
    );

    /// Invalid Contract Checksummed Address
    expect(() =>
      builder.generateZKProof({
        aclContractAddress,
        chainId,
        contractAddress: invalidChecksummedAddress,
        userAddress,
      }),
    ).toThrow(
      new EncryptionError({
        message: `Invalid contract checksummed address: ${invalidChecksummedAddress}`,
      }),
    );

    /// Invalid values
    expect(() => builder.addBool('hello' as any)).toThrow(
      'The value must be a boolean, a number or a bigint.',
    );
    expect(() => builder.addBool({} as any)).toThrow(
      'The value must be a boolean, a number or a bigint.',
    );
    expect(() => builder.addBool(29393 as any)).toThrow(
      'The value must be true, false, 0 or 1.',
    );
    expect(() => builder.addUint8(2 ** 8)).toThrow(
      'The value must be a number or bigint in uint8 range (0-255).',
    );
    expect(() => builder.addUint16(2 ** 16)).toThrow(
      'The value must be a number or bigint in uint16 range (0-65535).',
    );
    expect(() => builder.addUint32(2 ** 32)).toThrow(
      'The value must be a number or bigint in uint32 range (0-4294967295).',
    );
    expect(() => builder.addUint64(0xffffffffffffffffn + 1n)).toThrow(
      'The value must be a number or bigint in uint64 range.',
    );
    expect(() =>
      builder.addUint128(0xffffffffffffffffffffffffffffffffn + 1n),
    ).toThrow('The value must be a number or bigint in uint128 range.');
    expect(() =>
      builder.addUint256(
        0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn +
          1n,
      ),
    ).toThrow('The value must be a number or bigint in uint256 range.');
    expect(() => builder.addAddress('0x00')).toThrow(
      'The value must be a valid checksummed address.',
    );
  });

  it('throws if total bits is above 2048', async () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });
    for (let i = 0; i < 8; ++i) {
      builder.addUint256(BigInt(123456789) * BigInt(i + 1));
    }
    expect(() => builder.addBool(false)).toThrow(
      'Packing more than 2048 bits in a single input ciphertext is unsupported',
    );
  });

  it('count and totalBits getters', () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });
    expect(builder.count).toBe(0);
    expect(builder.totalBits).toBe(0);

    builder.addBool(true);
    expect(builder.count).toBe(1);
    expect(builder.totalBits).toBe(2); // ebool = 2 bits

    builder.addUint32(123);
    expect(builder.count).toBe(2);
    expect(builder.totalBits).toBe(34); // 2 + 32
  });

  it('getBits returns copy of bits array', () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });
    builder.addBool(true);
    builder.addUint8(42);

    const bits = builder.getBits();
    expect(bits).toEqual([2, 8]);

    // Verify it's a copy, not the original
    bits.push(16);
    expect(builder.getBits()).toEqual([2, 8]);
  });

  it('methods return this for chaining', () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });

    const result = builder
      .addBool(true)
      .addUint8(1)
      .addUint16(2)
      .addUint32(3)
      .addUint64(BigInt(4))
      .addUint128(BigInt(5))
      .addUint256(BigInt(6))
      .addAddress('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80');

    expect(result).toBe(builder);
  });

  it('throws on invalid ACL address', () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });
    builder.addUint8(1);

    expect(() =>
      builder.generateZKProof({
        aclContractAddress: '0x0' as ChecksummedAddress,
        chainId,
        contractAddress,
        userAddress,
      }),
    ).toThrow(
      new EncryptionError({
        message: 'Invalid ACL checksummed address: 0x0',
      }),
    );
  });

  it('throws on invalid chainId', () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });
    builder.addUint8(1);

    expect(() =>
      builder.generateZKProof({
        aclContractAddress,
        chainId: -1,
        contractAddress,
        userAddress,
      }),
    ).toThrow(
      new EncryptionError({
        message: 'Invalid chain ID uint64: -1',
      }),
    );
  });

  it('throws on negative values', () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });

    expect(() => builder.addUint8(-1)).toThrow();
    expect(() => builder.addUint16(-1)).toThrow();
    expect(() => builder.addUint32(-1)).toThrow();
    expect(() => builder.addUint64(BigInt(-1))).toThrow();
    expect(() => builder.addUint128(BigInt(-1))).toThrow();
    expect(() => builder.addUint256(BigInt(-1))).toThrow();
  });

  it('throws on null/undefined values for addBool', () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });

    expect(() => builder.addBool(null as any)).toThrow('Missing value');
    expect(() => builder.addBool(undefined as any)).toThrow('Missing value');
  });

  it('throws if packing more than 256 variables', () => {
    const builder = new TFHEZKProofBuilder({
      pkeParams: pkeParamsAsset,
    });

    for (let i = 0; i < 256; ++i) {
      builder.addBool(true);
    }
    expect(() => builder.addBool(true)).toThrow(
      `Packing more than 256 variables in a single input ciphertext is unsupported`,
    );
  });
});
