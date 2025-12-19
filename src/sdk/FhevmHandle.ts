import {
  assertIsBytes32,
  bytesToHex,
  concatBytes,
  hexToBytes,
  isBytes32Hex,
} from '../utils/bytes';
import {
  assertIsChecksummedAddress,
  checksummedAddressToBytes20,
} from '../utils/address';
import {
  assertIsUint64,
  assertIsUint8,
  MAX_UINT64,
  uint32ToBytes32,
} from '../utils/uint';
import { keccak256 } from 'ethers';
import { assertRelayer, InternalError } from '../errors/InternalError';
import { FhevmHandleError } from '../errors/FhevmHandleError';
import type {
  Bytes32,
  Bytes32Hex,
  BytesHex,
  ChecksummedAddress,
  FheTypeEncryptionBitwidth,
  FheTypeEncryptionBitwidthToIdMap,
  FheTypeId,
  FheTypeIdToEncryptionBitwidthMap,
  SolidityPrimitiveTypeName,
} from '../types/primitives';

type CreateInputHandlesBaseParams = {
  ciphertextWithZKProof: Uint8Array | BytesHex;
  aclAddress: ChecksummedAddress;
  chainId: number;
  ciphertextVersion: number;
};

type CreateInputHandlesParams = CreateInputHandlesBaseParams &
  (
    | { fheTypeIds: FheTypeId[]; fheTypeEncryptionBitwidths?: never }
    | {
        fheTypeIds?: never;
        fheTypeEncryptionBitwidths: FheTypeEncryptionBitwidth[];
      }
  );

////////////////////////////////////////////////////////////////////////////////
// FhevmHandle
////////////////////////////////////////////////////////////////////////////////

export class FhevmHandle {
  private readonly _hash21: string;
  private readonly _chainId: number;
  private readonly _fheTypeId: FheTypeId;
  private readonly _version: number;
  private readonly _computed: boolean;
  private readonly _index?: number;

  static readonly RAW_CT_HASH_DOMAIN_SEPARATOR = 'ZK-w_rct';
  static readonly HANDLE_HASH_DOMAIN_SEPARATOR = 'ZK-w_hdl';

  static readonly FheTypeIdToEncryptionBitwidths: FheTypeIdToEncryptionBitwidthMap =
    {
      0: 2,
      2: 8,
      3: 16,
      4: 32,
      5: 64,
      6: 128,
      7: 160,
      8: 256,
    } as const;

  static readonly FheTypeEncryptionBitwidthsToId: FheTypeEncryptionBitwidthToIdMap =
    {
      2: 0,
      8: 2,
      16: 3,
      32: 4,
      64: 5,
      128: 6,
      160: 7,
      256: 8,
    } as const;

  static readonly FheTypeIdToSolidityPrimitiveType: Record<
    FheTypeId,
    SolidityPrimitiveTypeName
  > = {
    0: 'bool',
    2: 'uint256',
    3: 'uint256',
    4: 'uint256',
    5: 'uint256',
    6: 'uint256',
    7: 'address',
    8: 'uint256',
  } as const;

  static {
    Object.freeze(FhevmHandle.FheTypeIdToEncryptionBitwidths);
    Object.freeze(FhevmHandle.FheTypeEncryptionBitwidthsToId);
  }

  private constructor(
    hash21: string,
    chainId: number,
    fheTypeId: FheTypeId,
    version: number,
    computed: boolean,
    index?: number,
  ) {
    if (BigInt(chainId) > MAX_UINT64) {
      // fhevm assumes chainID is only taking up to 8 bytes
      throw new Error('ChainId exceeds maximum allowed value (8 bytes)');
    }

    this._hash21 = hash21;
    this._chainId = chainId;
    this._fheTypeId = fheTypeId;
    this._version = version;
    this._computed = computed;
    if (index !== undefined) {
      this._index = index;
    }
  }

  public get hash21(): string {
    return this._hash21;
  }
  public get chainId(): number {
    return this._chainId;
  }
  public get fheTypeId(): FheTypeId {
    return this._fheTypeId;
  }
  public get version(): number {
    return this._version;
  }
  public get computed(): boolean {
    return this._computed;
  }
  public get index(): number | undefined {
    return this._index;
  }

  public static fromZKProof(params: CreateInputHandlesParams) {
    assertIsChecksummedAddress(params.aclAddress);
    assertIsUint64(params.chainId);
    assertIsUint8(params.ciphertextVersion);

    let fheTypeIds: FheTypeId[];

    if (params.fheTypeIds !== undefined) {
      fheTypeIds = params.fheTypeIds;
    } else if (params.fheTypeEncryptionBitwidths !== undefined) {
      fheTypeIds = params.fheTypeEncryptionBitwidths.map(
        (w) => FhevmHandle.FheTypeEncryptionBitwidthsToId[w],
      );
    } else {
      throw new InternalError({
        message:
          'createInputHandles requires either fheTypeIds or fheTypeEncryptionBitwidths',
      });
    }

    assertIsUint8(fheTypeIds.length);

    let ciphertextWithZKProof: Uint8Array;
    if (typeof params.ciphertextWithZKProof === 'string') {
      ciphertextWithZKProof = hexToBytes(params.ciphertextWithZKProof);
    } else if (params.ciphertextWithZKProof instanceof Uint8Array) {
      ciphertextWithZKProof = params.ciphertextWithZKProof;
    } else {
      throw new InternalError({
        message: 'Invalid ciphertextWithZKProof argument',
      });
    }

    if (ciphertextWithZKProof.length === 0) {
      throw new InternalError({
        message: 'Invalid ciphertextWithZKProof argument',
      });
    }

    const encoder = new TextEncoder();
    const domainSepBytes = encoder.encode(
      FhevmHandle.RAW_CT_HASH_DOMAIN_SEPARATOR,
    );

    const blobHashBytes32Hex: Bytes32Hex = keccak256(
      concatBytes(domainSepBytes, ciphertextWithZKProof),
    ) as Bytes32Hex;

    const handles: FhevmHandle[] = [];
    for (let i = 0; i < fheTypeIds.length; ++i) {
      const hash21 = FhevmHandle._computeInputHash21(
        hexToBytes(blobHashBytes32Hex),
        params.aclAddress,
        params.chainId,
        i,
      );
      handles.push(
        new FhevmHandle(
          hash21,
          params.chainId,
          fheTypeIds[i],
          params.ciphertextVersion,
          false,
          i,
        ),
      );
    }
    return handles;
  }

  /**
   * blobHashBytes32 = keccak256(ciphertextWithZKProof)
   */
  private static _computeInputHash21(
    blobHashBytes32: Bytes32,
    aclAddress: ChecksummedAddress,
    chainId: number,
    index: number,
  ) {
    /*
        https://github.com/zama-ai/fhevm/blob/8ffbd5906ab3d57af178e049930e3fc065c9d4b3/coprocessor/fhevm-engine/zkproof-worker/src/verifier.rs#L431C7-L431C8
    
        handle_hash = Bytes("ZK-w_hdl") + blobHash 32 Bytes + index 1 Byte + aclAddress 20 Bytes + chainId 32 bytes
        ===========================================================================================================

        const HANDLE_HASH_DOMAIN_SEPARATOR: [u8; 8] = *b"ZK-w_hdl";
        
        let mut handle_hash = Keccak256::new();
        handle_hash.update(HANDLE_HASH_DOMAIN_SEPARATOR);
        handle_hash.update(blob_hash);
        handle_hash.update([ct_idx as u8]);
        handle_hash.update(
            Address::from_str(&aux_data.acl_contract_address)
                .expect("valid acl_contract_address")
                .into_array(),
        );
        handle_hash.update(chain_id_bytes);
        let mut handle = handle_hash.finalize().to_vec();
        assert_eq!(handle.len(), 32);

    */
    assertIsBytes32(blobHashBytes32);
    assertIsChecksummedAddress(aclAddress);
    assertIsUint8(index);
    assertIsUint64(chainId);

    const encryptionIndexByte1 = new Uint8Array([index]);
    const aclContractAddressBytes20 = checksummedAddressToBytes20(aclAddress);
    const chainIdBytes32 = uint32ToBytes32(chainId);

    const encoder = new TextEncoder();
    const domainSepBytes = encoder.encode(
      FhevmHandle.HANDLE_HASH_DOMAIN_SEPARATOR,
    );

    return keccak256(
      concatBytes(
        domainSepBytes,
        blobHashBytes32,
        encryptionIndexByte1,
        aclContractAddressBytes20,
        chainIdBytes32,
      ),
    );
  }

  public toBytes32(): Bytes32 {
    assertRelayer(
      (this._index === undefined && this._computed) ||
        (this._index !== undefined && this._index < 255 && !this._computed),
    );

    const chainId32Bytes = uint32ToBytes32(this._chainId);
    const chainId8Bytes = chainId32Bytes.subarray(24, 32);

    const handleHash = hexToBytes(this._hash21);

    const handleBytes32AsBytes = new Uint8Array(32);
    handleBytes32AsBytes.set(handleHash, 0);
    handleBytes32AsBytes[21] = this._index === undefined ? 255 : this._index;
    handleBytes32AsBytes.set(chainId8Bytes, 22);
    handleBytes32AsBytes[30] = this._fheTypeId;
    handleBytes32AsBytes[31] = this._version;

    return handleBytes32AsBytes;
  }

  public toBytes32Hex(): Bytes32Hex {
    return bytesToHex(this.toBytes32()) as Bytes32Hex;
  }

  public static checkHandleHex(handle: unknown): asserts handle is Bytes32Hex {
    if (!isBytes32Hex(handle)) {
      throw new FhevmHandleError({ handle });
    }
  }

  public static isFheTypeId(value: unknown): value is FheTypeId {
    switch (value as FheTypeId) {
      case 0:
      // 1: euint4 is deprecated
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return true;
      default:
        return false;
    }
  }

  public static getFheTypeId(handle: unknown): FheTypeId {
    if (!isBytes32Hex(handle)) {
      throw new FhevmHandleError({ handle });
    }
    const hexPair = handle.slice(-4, -2).toLowerCase();
    const typeDiscriminant = parseInt(hexPair, 16);
    if (!FhevmHandle.isFheTypeId(typeDiscriminant)) {
      throw new FhevmHandleError({
        handle,
        message: `FHEVM Handle "${handle}" is invalid. Unknown FheType: ${typeDiscriminant}`,
      });
    }
    return typeDiscriminant;
  }
}
