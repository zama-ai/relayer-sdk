# CLI Reference

## Overview

The Relayer SDK (v0.4.0-alpha.2) includes command-line tools for testing, debugging, and managing FHEVM operations. These tools help developers verify their setup, test cryptographic operations, and debug integration issues without writing code.

---

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration Commands](#configuration-commands)
- [Cryptographic Operations](#cryptographic-operations)
- [Public Key Management](#public-key-management)
- [Testing Utilities](#testing-utilities)

---

## Installation

The CLI tools are included with the SDK:

```bash
npm install @zama-ai/relayer-sdk@0.4.0-alpha.2
```

Or install globally for easier access:

```bash
npm install -g @zama-ai/relayer-sdk@0.4.0-alpha.2
```

---

## Usage

Run commands using `npx` (local installation):

```bash
npx @zama-ai/relayer-sdk <command> [options]
```

Or directly if installed globally:

```bash
relayer <command> [options]
```

Get help for any command:

```bash
npx @zama-ai/relayer-sdk --help
npx @zama-ai/relayer-sdk <command> --help
```

---

## Configuration Commands

### config

Display SDK configuration information including network settings, contract addresses, and environment details.

**Usage:**

```bash
npx @zama-ai/relayer-sdk config [options]
```

**Options:**

- `--name` - Display configuration name (e.g., "Sepolia", "Mainnet")
- `--contract-address` - Show deployed contract addresses
- `--user-address` - Show user wallet address

**Examples:**

```bash
# Show all configuration
npx @zama-ai/relayer-sdk config

# Show just the network name
npx @zama-ai/relayer-sdk config --name

# Show contract addresses
npx @zama-ai/relayer-sdk config --contract-address
```

**Output Example:**

```
Configuration: Sepolia Testnet
Relayer URL: https://relayer.testnet.zama.org/v2
Gateway URL: https://gateway.testnet.zama.org

Contract Addresses:
  ACL: 0x123...abc
  KMS: 0x456...def
  Input Verifier: 0x789...ghi
```

---

## Cryptographic Operations

### input-proof

Generate a ZK proof and input proof for encrypted values. Useful for testing the proof generation workflow.

**Usage:**

```bash
npx @zama-ai/relayer-sdk input-proof --values <values>
```

**Arguments:**

- `--values` - Space-separated list of values in format `value:type`

**Supported Types:**

- `ebool` - Encrypted boolean
- `euint8` - Encrypted 8-bit unsigned integer
- `euint16` - Encrypted 16-bit unsigned integer
- `euint32` - Encrypted 32-bit unsigned integer
- `euint64` - Encrypted 64-bit unsigned integer
- `euint128` - Encrypted 128-bit unsigned integer
- `euint256` - Encrypted 256-bit unsigned integer
- `eaddress` - Encrypted Ethereum address

**Examples:**

```bash
# Single value
npx @zama-ai/relayer-sdk input-proof --values 123:euint32

# Multiple values
npx @zama-ai/relayer-sdk input-proof --values 123:euint32 true:ebool

# Different types
npx @zama-ai/relayer-sdk input-proof --values \
  255:euint8 \
  65535:euint16 \
  4294967295:euint32
```

**Output:**

```
Generating input proof for 2 values...

Handles:
  0x36a1f452...
  0xce6f699...

Input Proof:
  0x8f9e3a...

ZK Proof generated successfully!
```

### handle

Parse and display the structure of FHEVM handles. Useful for debugging handle encoding issues.

**Usage:**

```bash
npx @zama-ai/relayer-sdk handle <handles...>
```

**Arguments:**

- `<handles...>` - One or more hex-encoded handles (with or without 0x prefix)

**Examples:**

```bash
# Parse single handle
npx @zama-ai/relayer-sdk handle 0x36a1f452...

# Parse multiple handles
npx @zama-ai/relayer-sdk handle \
  0x36a1f452... \
  0xce6f699...
```

**Output:**

```
Handle 1: 0x36a1f452...
  Type: euint32 (ID: 4)
  Chain ID: 11155111
  Version: 0
  Hash: 0x36a1f452...
  Computed: true

Handle 2: 0xce6f699...
  Type: ebool (ID: 0)
  Chain ID: 11155111
  Version: 0
  Hash: 0xce6f699...
  Computed: false
```

### public-decrypt

Decrypt public ciphertext values. Useful for testing decryption workflows.

**Usage:**

```bash
npx @zama-ai/relayer-sdk public-decrypt --handles <handles...>
```

**Arguments:**

- `--handles` - Space-separated list of hex-encoded handles

**Options:**

- `--network` - Network to use (default: testnet)
- `--api-key` - API key for authentication (mainnet only)

**Examples:**

```bash
# Decrypt on testnet
npx @zama-ai/relayer-sdk public-decrypt \
  --handles 0x36a1f452... 0xce6f699...

# Decrypt on mainnet with API key
npx @zama-ai/relayer-sdk public-decrypt \
  --handles 0x36a1f452... \
  --network mainnet \
  --api-key your-api-key
```

**Output:**

```
Decrypting 2 handles...

Handle: 0x36a1f452...
  Type: euint32
  Value: 123

Handle: 0xce6f699...
  Type: ebool
  Value: true

Decryption complete!
```

---

## Public Key Management

The SDK caches public keys and parameters locally for performance. These commands help manage the cache.

### pubkey info

Display information about cached public keys and parameters.

**Usage:**

```bash
npx @zama-ai/relayer-sdk pubkey info
```

**Output:**

```
Public Key Cache Information:

Location: ~/.fhevm/public-key-cache/

Public Key:
  File: fhevm-public-key.bin
  Size: 2.4 MB
  ID: pk-v1-abc123
  Status: Valid

Public Parameters:
  2048-bit: params-2048.bin (1.2 MB) - Valid
  4096-bit: params-4096.bin (2.4 MB) - Valid

Cache is healthy.
```

### pubkey fetch

Download and cache the FHEVM public key and parameters.

**Usage:**

```bash
npx @zama-ai/relayer-sdk pubkey fetch [options]
```

**Options:**

- `--force` - Force re-download even if cache exists
- `--network` - Network to fetch from (default: testnet)

**Examples:**

```bash
# Fetch if not cached
npx @zama-ai/relayer-sdk pubkey fetch

# Force re-download
npx @zama-ai/relayer-sdk pubkey fetch --force

# Fetch for specific network
npx @zama-ai/relayer-sdk pubkey fetch --network mainnet
```

**Output:**

```
Fetching public key from testnet...
Downloading: fhevm-public-key.bin (2.4 MB)
Progress: ████████████████████ 100%

Fetching parameters...
Downloading: params-2048.bin (1.2 MB)
Progress: ████████████████████ 100%

Public key cached successfully!
Location: ~/.fhevm/public-key-cache/
```

### pubkey clear

Clear the cached public key and parameters.

**Usage:**

```bash
npx @zama-ai/relayer-sdk pubkey clear
```

**Aliases:**

- `pubkey delete`

**Examples:**

```bash
npx @zama-ai/relayer-sdk pubkey clear
```

**Output:**

```
Clearing public key cache...
Removed: ~/.fhevm/public-key-cache/fhevm-public-key.bin
Removed: ~/.fhevm/public-key-cache/params-2048.bin
Removed: ~/.fhevm/public-key-cache/params-4096.bin

Cache cleared successfully!
```

---

## Testing Utilities

### zkproof generate

Generate Zero-Knowledge proofs for testing the ZK proof verification workflow.

**Usage:**

```bash
npx @zama-ai/relayer-sdk zkproof generate --values <values>
```

**Arguments:**

- `--values` - Space-separated list of values in format `value:type`

**Examples:**

```bash
# Generate proof for single value
npx @zama-ai/relayer-sdk zkproof generate --values 123:euint32

# Generate proof for multiple values
npx @zama-ai/relayer-sdk zkproof generate --values \
  123:euint32 \
  true:ebool \
  0x1234567890abcdef:eaddress
```

**Output:**

```
Generating ZK proof...

Proof:
  0x8f9e3a...

Public Inputs:
  [123, 1, 0x1234567890abcdef]

ZK proof generated successfully!
Use this proof with requestZKProofVerification() API.
```

**Note:** This generates test proofs. For production, use your own ZK proof system.

### test fhecounter-getcount

Test helper for the FHECounter example contract. Useful for integration testing.

**Usage:**

```bash
npx @zama-ai/relayer-sdk test fhecounter-getcount [options]
```

**Options:**

- `--contract` - FHECounter contract address
- `--network` - Network to use (default: testnet)

**Examples:**

```bash
# Test on testnet
npx @zama-ai/relayer-sdk test fhecounter-getcount \
  --contract 0x123...abc

# Test on mainnet
npx @zama-ai/relayer-sdk test fhecounter-getcount \
  --contract 0x123...abc \
  --network mainnet
```

**Output:**

```
Testing FHECounter.getCount()...

Contract: 0x123...abc
Network: Sepolia Testnet

Calling getCount()...
Encrypted count: 0x36a1f452...

Decrypting...
Current count: 5

Test passed!
```

---

## Common Workflows

### Testing Input Proof Generation

```bash
# 1. Generate input proof
npx @zama-ai/relayer-sdk input-proof --values 123:euint32

# 2. Parse the returned handles
npx @zama-ai/relayer-sdk handle 0x36a1f452...

# 3. Verify in your contract
# Use handles in your contract's submitInput() call
```

### Debugging Decryption Issues

```bash
# 1. Check your handles are valid
npx @zama-ai/relayer-sdk handle 0x36a1f452...

# 2. Try public decryption
npx @zama-ai/relayer-sdk public-decrypt --handles 0x36a1f452...

# 3. Check public key cache
npx @zama-ai/relayer-sdk pubkey info

# 4. If issues, refresh cache
npx @zama-ai/relayer-sdk pubkey clear
npx @zama-ai/relayer-sdk pubkey fetch
```

### Verifying Setup

```bash
# 1. Check configuration
npx @zama-ai/relayer-sdk config

# 2. Ensure public key is cached
npx @zama-ai/relayer-sdk pubkey info

# 3. Test proof generation
npx @zama-ai/relayer-sdk input-proof --values 42:euint32

# 4. Test decryption
npx @zama-ai/relayer-sdk public-decrypt --handles <handle>
```

---

## Environment Variables

Some commands support environment variables:

- `RELAYER_API_KEY` - API key for authenticated requests (mainnet)
- `RELAYER_URL` - Override default relayer URL
- `GATEWAY_URL` - Override default gateway URL
- `PRIVATE_KEY` - Private key for signing transactions (user-decrypt command)

**Example:**

```bash
export RELAYER_API_KEY=your-api-key
npx @zama-ai/relayer-sdk public-decrypt --handles 0x... --network mainnet
```

---

## Related Documentation

- **[SDK Enhancements](./sdk-enhancements.md)** - Programmatic API usage for features shown in CLI
- **[Migrating to HTTP API V2](./migrating_to_v2.md)** - HTTP API V2 features and migration guide
- **[TypeScript Types](../src/types/)** - Type definitions for SDK

---

## Troubleshooting

### Command Not Found

If `npx @zama-ai/relayer-sdk` reports "command not found":

1. Verify installation: `npm list @zama-ai/relayer-sdk`
2. Reinstall if needed: `npm install @zama-ai/relayer-sdk@0.4.0-alpha.2`
3. Try with full path: `npx --package=@zama-ai/relayer-sdk relayer`

### Public Key Cache Issues

If commands fail with "public key not found":

```bash
# Clear and refresh cache
npx @zama-ai/relayer-sdk pubkey clear
npx @zama-ai/relayer-sdk pubkey fetch
```

### Network Connection Issues

If commands timeout:

1. Check network connectivity
2. Verify relayer URL is accessible
3. Check firewall settings
4. Try with explicit network: `--network testnet`

---

## Getting Help

- **Command Help:** `npx @zama-ai/relayer-sdk <command> --help`
- **Issues:** [GitHub Issues](https://github.com/zama-ai/relayer-sdk/issues)
- **Discussions:** [GitHub Discussions](https://github.com/zama-ai/relayer-sdk/discussions)
