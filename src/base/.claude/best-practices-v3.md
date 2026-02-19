# Parts like ethers.js/viem

1. Developer Error - Critical

- Strong types for handles, proofs, ciphertexts (you already have FhevmHandle, ZKProof, etc.)
- Make invalid states unrepresentable
- Validate all inputs at API boundaries
- Immutable objects

2. Accidental Leakage - Critical

- Private keys, decrypted values, intermediate states should never appear in:
  - toString() / toJSON() output
  - Error messages
  - Stack traces
- Consider wrapper types that hide sensitive data by default

3. Side-Channel - Relevant but constrained

- Use constant-time comparison for any secret-dependent equality checks
- Avoid early-return patterns on secret data
- Your WASM modules (TFHE) likely handle the heavy crypto - ensure they're constant-time
- JavaScript/TypeScript wrapper code should avoid branching on secrets

# Parts like @noble

- utils.equalBytes() is constant-time
- Private scalars are handled carefully
- Clear separation between public and secret data

1. Constant-Time Operations
2. No Branching on Secret Bits
3. Memory Hygiene
4. Never Expose in Logs/Errors
