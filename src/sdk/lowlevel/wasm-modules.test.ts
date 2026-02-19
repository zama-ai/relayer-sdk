import type { TFHEType, TKMSType } from './public-api';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/wasm-modules.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/wasm-modules.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

// Since TFHE and TKMS are singletons that persist across tests,
// we need to create fresh module instances for testing.
// We'll test the class behavior by creating a module that re-exports
// fresh instances for testing purposes.

// Mock TFHE module
function createMockTFHE(): TFHEType {
  return {
    TfheCompactPublicKey: Object.assign(jest.fn(), {
      safe_deserialize: jest.fn(),
    }),
    CompactPkeCrs: Object.assign(jest.fn(), {
      safe_deserialize: jest.fn(),
    }),
    CompactCiphertextList: Object.assign(jest.fn(), {
      builder: jest.fn(),
    }),
    ZkComputeLoad: {
      Verify: 42,
      Proof: 43,
    },
    ProvenCompactCiphertextList: Object.assign(jest.fn(), {
      safe_deserialize: jest.fn(),
    }),
    init_panic_hook: jest.fn(),
  } as unknown as TFHEType;
}

// Mock TKMS module
function createMockTKMS(): TKMSType {
  return {
    u8vec_to_ml_kem_pke_pk: jest.fn().mockReturnValue('pk'),
    u8vec_to_ml_kem_pke_sk: jest.fn().mockReturnValue('sk'),
    new_client: jest.fn().mockReturnValue('client'),
    new_server_id_addr: jest.fn().mockReturnValue('server'),
    process_user_decryption_resp_from_js: jest
      .fn()
      .mockReturnValue('decrypted'),
    ml_kem_pke_keygen: jest.fn().mockReturnValue('keypair'),
    ml_kem_pke_pk_to_u8vec: jest
      .fn()
      .mockReturnValue(new Uint8Array([1, 2, 3])),
    ml_kem_pke_sk_to_u8vec: jest
      .fn()
      .mockReturnValue(new Uint8Array([4, 5, 6])),
    ml_kem_pke_get_pk: jest.fn().mockReturnValue('public-key'),
  } as unknown as TKMSType;
}

// We need to isolate tests since the module uses singletons
// Reset modules before each test file to get fresh singleton instances
beforeEach(() => {
  jest.resetModules();
});

describe('TFHEModule', () => {
  describe('initialization', () => {
    it('should start uninitialized', async () => {
      const { TFHE } = await import('./wasm-modules');
      expect(TFHE.isInitialized).toBe(false);
      expect(TFHE.isMockMode).toBe(false);
    });

    it('xxx should initialize with init()', async () => {
      const { TFHE } = await import('./wasm-modules');
      const mockTFHE = createMockTFHE();

      TFHE.init(mockTFHE);

      expect(TFHE.isInitialized).toBe(true);
      expect(TFHE.isMockMode).toBe(false);
    });

    it('should initialize with initMock()', async () => {
      const { TFHE } = await import('./wasm-modules');
      const mockTFHE = createMockTFHE();

      TFHE.initMock(mockTFHE);

      expect(TFHE.isInitialized).toBe(true);
      expect(TFHE.isMockMode).toBe(true);
    });

    it('should silently ignore double init() calls', async () => {
      const { TFHE } = await import('./wasm-modules');
      const mockTFHE1 = createMockTFHE();
      const mockTFHE2 = createMockTFHE();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      TFHE.init(mockTFHE1);
      TFHE.init(mockTFHE2); // Should not throw, just log

      expect(consoleSpy).toHaveBeenCalledWith(
        'TFHE module already initialized',
      );
      expect(TFHE.isInitialized).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should not allow re-initialization in mock mode with TFHE initMock()', async () => {
      const { TFHE } = await import('./wasm-modules');
      const mockTFHE1 = createMockTFHE();
      const mockTFHE2 = createMockTFHE();
      (mockTFHE2.ZkComputeLoad as { Verify: number }).Verify = 123;

      TFHE.initMock(mockTFHE1);
      expect(TFHE.ZkComputeLoadVerify).toBe(42);

      TFHE.initMock(mockTFHE2);
      expect(TFHE.ZkComputeLoadVerify).toBe(42);
    });

    it('should silently ignore initMock() after production init()', async () => {
      const { TFHE } = await import('./wasm-modules');
      const mockTFHE = createMockTFHE();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      TFHE.init(mockTFHE);
      TFHE.initMock(mockTFHE); // Should not throw in SILENT mode

      expect(consoleSpy).toHaveBeenCalledWith(
        'TFHE module already initialized',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getters before initialization', () => {
    it('should throw when accessing TfheCompactPublicKey before init', async () => {
      const { TFHE } = await import('./wasm-modules');
      expect(() => TFHE.TfheCompactPublicKey).toThrow(
        'TFHE module not initialized. Call setTFHE() first.',
      );
    });

    it('should throw when accessing CompactPkeCrs before init', async () => {
      const { TFHE } = await import('./wasm-modules');
      expect(() => TFHE.CompactPkeCrs).toThrow(
        'TFHE module not initialized. Call setTFHE() first.',
      );
    });

    it('should throw when accessing CompactCiphertextList before init', async () => {
      const { TFHE } = await import('./wasm-modules');
      expect(() => TFHE.CompactCiphertextList).toThrow(
        'TFHE module not initialized. Call setTFHE() first.',
      );
    });

    it('should throw when accessing ZkComputeLoadVerify before init', async () => {
      const { TFHE } = await import('./wasm-modules');
      expect(() => TFHE.ZkComputeLoadVerify).toThrow(
        'TFHE module not initialized. Call setTFHE() first.',
      );
    });

    it('should throw when accessing ZkComputeLoadProof before init', async () => {
      const { TFHE } = await import('./wasm-modules');
      expect(() => TFHE.ZkComputeLoadProof).toThrow(
        'TFHE module not initialized. Call setTFHE() first.',
      );
    });

    it('should throw when accessing ProvenCompactCiphertextList before init', async () => {
      const { TFHE } = await import('./wasm-modules');
      expect(() => TFHE.ProvenCompactCiphertextList).toThrow(
        'TFHE module not initialized. Call setTFHE() first.',
      );
    });
  });

  describe('getters after initialization', () => {
    it('should return captured values after init', async () => {
      const { TFHE } = await import('./wasm-modules');
      const mockTFHE = createMockTFHE();

      TFHE.initMock(mockTFHE);

      expect(TFHE.TfheCompactPublicKey).toBe(mockTFHE.TfheCompactPublicKey);
      expect(TFHE.CompactPkeCrs).toBe(mockTFHE.CompactPkeCrs);
      expect(TFHE.CompactCiphertextList).toBe(mockTFHE.CompactCiphertextList);
      expect(TFHE.ZkComputeLoadVerify).toBe(mockTFHE.ZkComputeLoad.Verify);
      expect(TFHE.ZkComputeLoadProof).toBe(mockTFHE.ZkComputeLoad.Proof);
      expect(TFHE.ProvenCompactCiphertextList).toBe(
        mockTFHE.ProvenCompactCiphertextList,
      );
    });

    it('should capture ZkComputeLoad nested properties separately (security)', async () => {
      const { TFHE } = await import('./wasm-modules');
      const mockTFHE = createMockTFHE();

      TFHE.initMock(mockTFHE);

      // Attempt to tamper with the original object after init
      (mockTFHE.ZkComputeLoad as { Verify: number }).Verify = 123;

      // The captured value should remain unchanged
      expect(TFHE.ZkComputeLoadVerify).toBe(42);
    });
  });
});

describe('TKMSModule', () => {
  describe('initialization', () => {
    it('should start uninitialized', async () => {
      const { TKMS } = await import('./wasm-modules');
      expect(TKMS.isInitialized).toBe(false);
      expect(TKMS.isMockMode).toBe(false);
    });

    it('should initialize with init()', async () => {
      const { TKMS } = await import('./wasm-modules');
      const mockTKMS = createMockTKMS();

      TKMS.init(mockTKMS);

      expect(TKMS.isInitialized).toBe(true);
      expect(TKMS.isMockMode).toBe(false);
    });

    it('should initialize with initMock()', async () => {
      const { TKMS } = await import('./wasm-modules');
      const mockTKMS = createMockTKMS();

      TKMS.initMock(mockTKMS);

      expect(TKMS.isInitialized).toBe(true);
      expect(TKMS.isMockMode).toBe(true);
    });

    it('should silently ignore double init() calls', async () => {
      const { TKMS } = await import('./wasm-modules');
      const mockTKMS = createMockTKMS();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      TKMS.init(mockTKMS);
      TKMS.init(mockTKMS);

      expect(consoleSpy).toHaveBeenCalledWith(
        'TKMS module already initialized',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getters before initialization', () => {
    it('should throw when accessing u8vec_to_ml_kem_pke_pk before init', async () => {
      const { TKMS } = await import('./wasm-modules');
      expect(() => TKMS.u8vec_to_ml_kem_pke_pk).toThrow(
        'TKMS module not initialized. Call setTKMS() first.',
      );
    });

    it('should throw when accessing ml_kem_pke_keygen before init', async () => {
      const { TKMS } = await import('./wasm-modules');
      expect(() => TKMS.ml_kem_pke_keygen).toThrow(
        'TKMS module not initialized. Call setTKMS() first.',
      );
    });
  });

  describe('getters after initialization', () => {
    it('should return working functions after init', async () => {
      const { TKMS } = await import('./wasm-modules');
      const mockTKMS = createMockTKMS();

      TKMS.initMock(mockTKMS);

      // Call the captured functions
      const result = TKMS.ml_kem_pke_keygen();
      expect(result).toBe('keypair');
      expect(mockTKMS.ml_kem_pke_keygen).toHaveBeenCalled();
    });

    it('should bind methods correctly to preserve this context', async () => {
      const { TKMS } = await import('./wasm-modules');

      // Create a mock that relies on 'this' context
      const mockTKMS = {
        _value: 'bound-correctly',
        u8vec_to_ml_kem_pke_pk: jest.fn(function (this: { _value: string }) {
          return this._value;
        }),
        u8vec_to_ml_kem_pke_sk: jest.fn(),
        new_client: jest.fn(),
        new_server_id_addr: jest.fn(),
        process_user_decryption_resp_from_js: jest.fn(),
        ml_kem_pke_keygen: jest.fn(),
        ml_kem_pke_pk_to_u8vec: jest.fn(),
        ml_kem_pke_sk_to_u8vec: jest.fn(),
        ml_kem_pke_get_pk: jest.fn(),
      } as unknown as TKMSType;

      TKMS.initMock(mockTKMS);

      // Get the function and call it separately (would lose 'this' without bind)
      const fn = TKMS.u8vec_to_ml_kem_pke_pk;
      const result = fn(new Uint8Array());
      expect(result).toBe('bound-correctly');
    });
  });
});

describe('helpers', () => {
  it('setTFHE should call TFHE.init', async () => {
    const { TFHE, setTFHE } = await import('./wasm-modules');
    const mockTFHE = createMockTFHE();

    setTFHE(mockTFHE);

    expect(TFHE.isInitialized).toBe(true);
    expect(TFHE.isMockMode).toBe(false);
  });

  it('setTFHEMock should call TFHE.initMock', async () => {
    const { TFHE, setTFHEMock } = await import('./wasm-modules');
    const mockTFHE = createMockTFHE();

    setTFHEMock(mockTFHE);

    expect(TFHE.isInitialized).toBe(true);
    expect(TFHE.isMockMode).toBe(true);
  });

  it('setTKMS should call TKMS.init', async () => {
    const { TKMS, setTKMS } = await import('./wasm-modules');
    const mockTKMS = createMockTKMS();

    setTKMS(mockTKMS);

    expect(TKMS.isInitialized).toBe(true);
    expect(TKMS.isMockMode).toBe(false);
  });

  it('setTKMSMock should call TKMS.initMock', async () => {
    const { TKMS, setTKMSMock } = await import('./wasm-modules');
    const mockTKMS = createMockTKMS();

    setTKMSMock(mockTKMS);

    expect(TKMS.isInitialized).toBe(true);
    expect(TKMS.isMockMode).toBe(true);
  });
});
