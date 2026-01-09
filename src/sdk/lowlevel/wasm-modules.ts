/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { TFHEType, TKMSType } from './public-api';

const SILENT = true;

////////////////////////////////////////////////////////////////////////////////
// TFHEModule
////////////////////////////////////////////////////////////////////////////////

class TFHEModule {
  #default: TFHEType['default'] | null = null;
  #init_panic_hook: TFHEType['init_panic_hook'] | null = null;
  #initThreadPool: TFHEType['initThreadPool'] | null = null;
  #TfheCompactPublicKey: TFHEType['TfheCompactPublicKey'] | null = null;
  #CompactPkeCrs: TFHEType['CompactPkeCrs'] | null = null;
  #CompactCiphertextList: TFHEType['CompactCiphertextList'] | null = null;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  #ZkComputeLoadVerify: TFHEType['ZkComputeLoad']['Verify'] | null = null;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  #ZkComputeLoadProof: TFHEType['ZkComputeLoad']['Proof'] | null = null;
  #ProvenCompactCiphertextList: TFHEType['ProvenCompactCiphertextList'] | null =
    null;

  #initialized = false;
  #initializing = false;
  #isMockMode = false;

  init(tfhe: TFHEType): void {
    if (this.#initializing) {
      if (SILENT) {
        console.log('TFHE module already initializing');
        return;
      }
      throw new Error('TFHE module initialization already in progress');
    }
    if (this.#initialized) {
      if (SILENT) {
        console.log('TFHE module already initialized');
        return;
      }
      throw new Error('TFHE module already initialized');
    }
    this.#initializing = true;
    try {
      this.#capture(tfhe);
      this.#initialized = true;
    } finally {
      this.#initializing = false;
    }
  }

  initMock(tfhe: TFHEType): void {
    if (this.#initializing) {
      if (SILENT) {
        console.log('TFHE module already initializing');
        return;
      }
      throw new Error('TFHE module initialization already in progress');
    }
    if (this.#initialized) {
      if (SILENT) {
        console.log('TFHE module already initialized');
        return;
      }
      throw new Error(
        'Cannot set mock TFHE: production module already initialized',
      );
    }
    this.#initializing = true;
    try {
      this.#isMockMode = true;
      this.#capture(tfhe);
      this.#initialized = true;
    } finally {
      this.#initializing = false;
    }
  }

  //   reset(): void {
  //     if (this.#initializing) {
  //       throw new Error('Cannot reset TFHE module during initialization');
  //     }
  //     if (!this.#isMockMode) {
  //       throw new Error('Cannot reset TFHE module outside of mock mode');
  //     }
  //     this.#default = null;
  //     this.#TfheCompactPublicKey = null;
  //     this.#CompactPkeCrs = null;
  //     this.#CompactCiphertextList = null;
  //     this.#ZkComputeLoadVerify = null;
  //     this.#ZkComputeLoadProof = null;
  //     this.#ProvenCompactCiphertextList = null;
  //     this.#init_panic_hook = null;
  //     this.#initThreadPool = null;
  //     this.#initialized = false;
  //   }

  #capture(tfhe: TFHEType): void {
    this.#default = tfhe.default;
    this.#TfheCompactPublicKey = tfhe.TfheCompactPublicKey;
    this.#CompactPkeCrs = tfhe.CompactPkeCrs;
    this.#CompactCiphertextList = tfhe.CompactCiphertextList;
    this.#init_panic_hook = tfhe.init_panic_hook.bind(tfhe);
    this.#initThreadPool = tfhe.initThreadPool?.bind(tfhe);
    // Capture nested properties separately to prevent tampering
    this.#ZkComputeLoadVerify = tfhe.ZkComputeLoad.Verify;
    this.#ZkComputeLoadProof = tfhe.ZkComputeLoad.Proof;
    this.#ProvenCompactCiphertextList = tfhe.ProvenCompactCiphertextList;
  }

  #getOrThrow<T>(value: T | null): T {
    if (this.#initializing) {
      throw new Error('Cannot access TFHE module during initialization');
    }
    if (!this.#initialized || value === null) {
      throw new Error('TFHE module not initialized. Call setTFHE() first.');
    }
    return value;
  }

  get initTFHE(): TFHEType['default'] {
    return this.#getOrThrow(this.#default);
  }

  get init_panic_hook(): TFHEType['init_panic_hook'] {
    return this.#getOrThrow(this.#init_panic_hook);
  }

  get initThreadPool(): TFHEType['initThreadPool'] {
    return this.#getOrThrow(this.#initThreadPool);
  }

  get TfheCompactPublicKey(): TFHEType['TfheCompactPublicKey'] {
    return this.#getOrThrow(this.#TfheCompactPublicKey);
  }

  get CompactPkeCrs(): TFHEType['CompactPkeCrs'] {
    return this.#getOrThrow(this.#CompactPkeCrs);
  }

  get CompactCiphertextList(): TFHEType['CompactCiphertextList'] {
    return this.#getOrThrow(this.#CompactCiphertextList);
  }

  get ZkComputeLoadVerify(): TFHEType['ZkComputeLoad']['Verify'] {
    return this.#getOrThrow(this.#ZkComputeLoadVerify);
  }

  get ZkComputeLoadProof(): TFHEType['ZkComputeLoad']['Proof'] {
    return this.#getOrThrow(this.#ZkComputeLoadProof);
  }

  get ProvenCompactCiphertextList(): TFHEType['ProvenCompactCiphertextList'] {
    return this.#getOrThrow(this.#ProvenCompactCiphertextList);
  }

  get isInitializing(): boolean {
    return this.#initializing;
  }

  get isInitialized(): boolean {
    return this.#initialized;
  }

  get isMockMode(): boolean {
    return this.#isMockMode;
  }
}

////////////////////////////////////////////////////////////////////////////////
// TKMSModule
////////////////////////////////////////////////////////////////////////////////

class TKMSModule {
  #default: TKMSType['default'] | null = null;
  #u8vecToMlKemPkePk: TKMSType['u8vec_to_ml_kem_pke_pk'] | null = null;
  #u8vecToMlKemPkeSk: TKMSType['u8vec_to_ml_kem_pke_sk'] | null = null;
  #newClient: TKMSType['new_client'] | null = null;
  #newServerIdAddr: TKMSType['new_server_id_addr'] | null = null;
  #processUserDecryptionRespFromJs:
    | TKMSType['process_user_decryption_resp_from_js']
    | null = null;
  #mlKemPkeKeygen: TKMSType['ml_kem_pke_keygen'] | null = null;
  #mlKemPkePkToU8vec: TKMSType['ml_kem_pke_pk_to_u8vec'] | null = null;
  #mlKemPkeSkToU8vec: TKMSType['ml_kem_pke_sk_to_u8vec'] | null = null;
  #mlKemPkeGetPk: TKMSType['ml_kem_pke_get_pk'] | null = null;

  #initialized = false;
  #initializing = false;
  #isMockMode = false;

  init(tkms: TKMSType): void {
    if (this.#initializing) {
      if (SILENT) {
        console.log('TKMS module already initializing');
        return;
      }
      throw new Error('TKMS module initialization already in progress');
    }
    if (this.#initialized) {
      if (SILENT) {
        console.log('TKMS module already initialized');
        return;
      }
      throw new Error('TKMS module already initialized');
    }
    this.#initializing = true;
    try {
      this.#capture(tkms);
      this.#initialized = true;
    } finally {
      this.#initializing = false;
    }
  }

  initMock(tkms: TKMSType): void {
    if (this.#initializing) {
      if (SILENT) {
        console.log('TKMS module already initialized');
        return;
      }
      throw new Error('TKMS module initialization already in progress');
    }
    if (this.#initialized) {
      if (SILENT) {
        console.log('TKMS module already initialized');
        return;
      }
      throw new Error(
        'Cannot set mock TKMS: production module already initialized',
      );
    }
    this.#initializing = true;
    try {
      this.#isMockMode = true;
      this.#capture(tkms);
      this.#initialized = true;
    } finally {
      this.#initializing = false;
    }
  }

  //   reset(): void {
  //     if (this.#initializing) {
  //       throw new Error('Cannot reset TKMS module during initialization');
  //     }
  //     if (!this.#isMockMode) {
  //       throw new Error('Cannot reset TKMS module outside of mock mode');
  //     }
  //     this.#default = null;
  //     this.#u8vecToMlKemPkePk = null;
  //     this.#u8vecToMlKemPkeSk = null;
  //     this.#newClient = null;
  //     this.#newServerIdAddr = null;
  //     this.#processUserDecryptionRespFromJs = null;
  //     this.#mlKemPkeKeygen = null;
  //     this.#mlKemPkePkToU8vec = null;
  //     this.#mlKemPkeSkToU8vec = null;
  //     this.#mlKemPkeGetPk = null;
  //     this.#initialized = false;
  //   }

  #capture(tkms: TKMSType): void {
    this.#default = tkms.default;
    // Bind methods to preserve 'this' context when called separately
    this.#u8vecToMlKemPkePk = tkms.u8vec_to_ml_kem_pke_pk.bind(tkms);
    this.#u8vecToMlKemPkeSk = tkms.u8vec_to_ml_kem_pke_sk.bind(tkms);
    this.#newClient = tkms.new_client.bind(tkms);
    this.#newServerIdAddr = tkms.new_server_id_addr.bind(tkms);
    this.#processUserDecryptionRespFromJs =
      tkms.process_user_decryption_resp_from_js.bind(tkms);
    this.#mlKemPkeKeygen = tkms.ml_kem_pke_keygen.bind(tkms);
    this.#mlKemPkePkToU8vec = tkms.ml_kem_pke_pk_to_u8vec.bind(tkms);
    this.#mlKemPkeSkToU8vec = tkms.ml_kem_pke_sk_to_u8vec.bind(tkms);
    this.#mlKemPkeGetPk = tkms.ml_kem_pke_get_pk.bind(tkms);
  }

  #getOrThrow<T>(value: T | null): T {
    if (this.#initializing) {
      throw new Error('Cannot access TKMS module during initialization');
    }
    if (!this.#initialized || value === null) {
      throw new Error('TKMS module not initialized. Call setTKMS() first.');
    }
    return value;
  }

  get initTKMS(): TKMSType['default'] {
    return this.#getOrThrow(this.#default);
  }

  get u8vec_to_ml_kem_pke_pk(): TKMSType['u8vec_to_ml_kem_pke_pk'] {
    return this.#getOrThrow(this.#u8vecToMlKemPkePk);
  }

  get u8vec_to_ml_kem_pke_sk(): TKMSType['u8vec_to_ml_kem_pke_sk'] {
    return this.#getOrThrow(this.#u8vecToMlKemPkeSk);
  }

  get new_client(): TKMSType['new_client'] {
    return this.#getOrThrow(this.#newClient);
  }

  get new_server_id_addr(): TKMSType['new_server_id_addr'] {
    return this.#getOrThrow(this.#newServerIdAddr);
  }

  get process_user_decryption_resp_from_js(): TKMSType['process_user_decryption_resp_from_js'] {
    return this.#getOrThrow(this.#processUserDecryptionRespFromJs);
  }

  get ml_kem_pke_keygen(): TKMSType['ml_kem_pke_keygen'] {
    return this.#getOrThrow(this.#mlKemPkeKeygen);
  }

  get ml_kem_pke_pk_to_u8vec(): TKMSType['ml_kem_pke_pk_to_u8vec'] {
    return this.#getOrThrow(this.#mlKemPkePkToU8vec);
  }

  get ml_kem_pke_sk_to_u8vec(): TKMSType['ml_kem_pke_sk_to_u8vec'] {
    return this.#getOrThrow(this.#mlKemPkeSkToU8vec);
  }

  get ml_kem_pke_get_pk(): TKMSType['ml_kem_pke_get_pk'] {
    return this.#getOrThrow(this.#mlKemPkeGetPk);
  }

  get isInitializing(): boolean {
    return this.#initializing;
  }

  get isInitialized(): boolean {
    return this.#initialized;
  }

  get isMockMode(): boolean {
    return this.#isMockMode;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Singleton Instances
////////////////////////////////////////////////////////////////////////////////

export const TFHE = new TFHEModule();
export const TKMS = new TKMSModule();

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

export function setTFHE(tfhe: TFHEType): void {
  TFHE.init(tfhe);
}

export function setTFHEMock(tfhe: TFHEType): void {
  TFHE.initMock(tfhe);
}

export function setTKMS(tkms: TKMSType): void {
  TKMS.init(tkms);
}

export function setTKMSMock(tkms: TKMSType): void {
  TKMS.initMock(tkms);
}

// export function resetWasmModules(): void {
//   TFHE.reset();
//   TKMS.reset();
// }
