import {
  CompactCiphertextListBuilderWasmType,
  CompactPkeCrsWasmType,
  ProvenCompactCiphertextListWasmType,
} from '@sdk/types/public-api';

export enum ZkComputeLoadMock {
  Proof = 0,
  Verify = 1,
}

class ProvenCompactCiphertextListMock {
  private _data: Uint8Array;
  private constructor() {
    this._data = new Uint8Array();
  }
  public get_kind_of(index: number) {
    return 0;
  }
  public is_empty() {
    return true;
  }
  public len() {
    return 0;
  }
  public free() {}
  safe_serialize(serialized_size_limit: bigint): Uint8Array {
    return this._data;
  }
  static safe_deserialize(
    buffer: Uint8Array,
    serialized_size_limit: bigint,
  ): ProvenCompactCiphertextListMock {
    const instance = new ProvenCompactCiphertextListMock();
    instance._data = buffer;
    return instance;
  }
}

class CompactPkeCrsMock {
  private _data: Uint8Array;
  private constructor() {
    this._data = new Uint8Array();
  }
  safe_serialize(serialized_size_limit: bigint): Uint8Array {
    return this._data;
  }
  static safe_deserialize(
    buffer: Uint8Array,
    serialized_size_limit: bigint,
  ): CompactPkeCrsMock {
    const instance = new CompactPkeCrsMock();
    instance._data = buffer;
    return instance;
  }
}

class TfheCompactPublicKeyMock {
  private _data: Uint8Array;
  private constructor() {
    this._data = new Uint8Array();
  }
  safe_serialize(serialized_size_limit: bigint): Uint8Array {
    return this._data;
  }
  static safe_deserialize(
    buffer: Uint8Array,
    serialized_size_limit: bigint,
  ): TfheCompactPublicKeyMock {
    const instance = new TfheCompactPublicKeyMock();
    instance._data = buffer;
    return instance;
  }
}

class TFHEInputMock {}
class CompactCiphertextListMock {
  static builder(
    public_key: TfheCompactPublicKeyMock,
  ): CompactCiphertextListBuilderMock {
    return new CompactCiphertextListBuilderMock();
  }
}
class CompactCiphertextListBuilderMock
  implements CompactCiphertextListBuilderWasmType
{
  free(): void {
    throw new Error('Method not implemented.');
  }
  push_boolean(value: boolean): void {
    throw new Error('Method not implemented.');
  }
  push_u8(value: number): void {
    throw new Error('Method not implemented.');
  }
  push_u16(value: number): void {
    throw new Error('Method not implemented.');
  }
  push_u32(value: number): void {
    throw new Error('Method not implemented.');
  }
  push_u64(value: bigint): void {
    throw new Error('Method not implemented.');
  }
  push_u128(value: bigint): void {
    throw new Error('Method not implemented.');
  }
  push_u160(value: bigint): void {
    throw new Error('Method not implemented.');
  }
  push_u256(value: bigint): void {
    throw new Error('Method not implemented.');
  }
  build_with_proof_packed(
    crs: CompactPkeCrsWasmType,
    metadata: Uint8Array,
    compute_load: unknown,
  ): ProvenCompactCiphertextListWasmType {
    throw new Error('Method not implemented.');
  }
}

function init_panic_hook_mock(): void {}
function initThreadPoolMock(): Promise<void> {
  return Promise.resolve();
}

export {
  TfheCompactPublicKeyMock as TfheCompactPublicKey,
  CompactPkeCrsMock as CompactPkeCrs,
  TFHEInputMock as TFHEInput,
  init_panic_hook_mock as init_panic_hook,
  initThreadPoolMock as initThreadPool,
  CompactCiphertextListMock as CompactCiphertextList,
  ZkComputeLoadMock as ZkComputeLoad,
  ProvenCompactCiphertextListMock as ProvenCompactCiphertextList,
};
