export enum ZkComputeLoadMock {
  Proof = 0,
  Verify = 1,
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
class CompactCiphertextListMock {}

function init_panic_hook_mock() {}
function initThreadPoolMock() {}

export {
  TfheCompactPublicKeyMock as TfheCompactPublicKey,
  CompactPkeCrsMock as CompactPkeCrs,
  TFHEInputMock as TFHEInput,
  init_panic_hook_mock as init_panic_hook,
  initThreadPoolMock as initThreadPool,
  CompactCiphertextListMock as CompactCiphertextList,
  ZkComputeLoadMock as ZkComputeLoad,
};
