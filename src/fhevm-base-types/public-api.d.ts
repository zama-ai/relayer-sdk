import type {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint256,
  Uint8Number,
} from '@base/types/primitives';

////////////////////////////////////////////////////////////////////////////////
//
// Fhevm Host Contracts
//
////////////////////////////////////////////////////////////////////////////////

/**
 * # FhevmChainLib - Library Abstraction Layer
 *
 * Abstracts ethers/viem differences behind a common interface.
 *
 * ## Architecture
 *
 * ```
 * ┌─────────────────┐     ┌─────────────────┐
 * │   fhevm-viem    │     │  fhevm-ethers   │
 * │ (implements     │     │ (implements     │
 * │  IFhevmChainLib)│     │  IFhevmChainLib)│
 * └────────┬────────┘     └────────┬────────┘
 *          │                       │
 *          └───────────┬───────────┘
 *                      ▼
 *          ┌─────────────────────┐
 *          │      fhevm-sdk      │
 *          │ (library-agnostic)  │
 *          └─────────────────────┘
 * ```
 *
 * ## Usage with viem
 *
 * ```typescript
 * import { createPublicClient, http } from 'viem';
 * import { mainnet } from 'viem/chains';
 * import { createFhevmChainLib } from 'fhevm-viem';
 * import { createInstance } from 'fhevm-sdk';
 *
 * // 1. Create viem client (dApp developer controls this)
 * const nativeClient = createPublicClient({
 *   chain: mainnet,
 *   transport: http('https://rpc.example.com'),
 * });
 *
 * // 2. Create chain lib adapter
 * const chainLib = await createFhevmChainLib();
 *
 * // 3. Initialize FHEVM instance
 * const fhevm = await createInstance({ chainLib, nativeClient, ...config });
 * ```
 *
 * ## Usage with ethers
 *
 * ```typescript
 * import { JsonRpcProvider } from 'ethers';
 * import { createFhevmChainLib } from 'fhevm-ethers';
 * import { createInstance } from 'fhevm-sdk';
 *
 * // 1. Create ethers provider (dApp developer controls this)
 * const nativeClient = new JsonRpcProvider('https://rpc.example.com');
 *
 * // 2. Create chain lib adapter
 * const chainLib = await createFhevmChainLib();
 *
 * // 3. Initialize FHEVM instance
 * const fhevm = await createInstance({ chainLib, nativeClient, ...config });
 * ```
 *
 * @remarks
 * - `nativeClient` is opaque to the SDK (`unknown` type)
 * - Type safety is enforced at the fhevm-viem/fhevm-ethers boundary
 * - The SDK passes `nativeClient` through to chainLib methods
 *
 * @internal
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export type createFhevmLibsFn = (config?: unknown) => Promise<FhevmLibs>;
export type NativeClient = unknown;

export interface FhevmChainClient {
  readonly libs: FhevmLibs;
  readonly nativeClient: NativeClient;
  readonly batchRpcCalls?: boolean;
}

/**
 * No public documentation
 * @internal
 */
export interface FhevmLibs {
  aclContractLib: ACLContractLib;
  inputVerifierContractLib: InputVerifierContractLib;
  kmsVerifierContractLib: KMSVerifierContractLib;
  fhevmExecutorContractLib: FHEVMExecutorContractLib;
  eip712Lib: EIP712Lib;
  abiLib: ABILib;
  publicClientLib: PublicClientLib;
}

/*

export interface FhevmHostContractLibs {
  aclContractLib: ACLContractLib;
  inputVerifierContractLib: InputVerifierContractLib;
  kmsVerifierContractLib: KMSVerifierContractLib;
  fhevmExecutorContractLib: FHEVMExecutorContractLib;
}
export interface FhevmEthereumLibs {
  eip712Lib: EIP712Lib;
  abiLib: ABILib;
  publicClientLib: PublicClientLib;
}
export interface FhevmLibs extends FhevmHostContractLibs, FhevmEthereumLibs {}
*/

/**
 * No public documentation
 * The caller is responsible
 * @internal
 */
export interface ACLContractLib {
  persistAllowed(
    nativeClient: NativeClient,
    aclContractAddress: ChecksummedAddress,
    args: {
      handle: Bytes32Hex;
      account: ChecksummedAddress;
    },
  ): Promise<boolean>;
  isAllowedForDecryption(
    nativeClient: NativeClient,
    aclContractAddress: ChecksummedAddress,
    args: {
      handle: Bytes32Hex;
    },
  ): Promise<boolean>;
  getFHEVMExecutorAddress(
    nativeClient: unknown,
    aclContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress>;
}

/**
 * No public documentation
 * The caller is responsible
 * @internal
 */
export interface InputVerifierContractLib {
  getCoprocessorSigners(
    nativeClient: NativeClient,
    inputVerifierContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress[]>;
  getThreshold(
    nativeClient: NativeClient,
    inputVerifierContractAddress: ChecksummedAddress,
  ): Promise<unknown>;
  eip712Domain(
    nativeClient: NativeClient,
    inputVerifierContractAddress: ChecksummedAddress,
  ): Promise<unknown[]>;
}

/**
 * No public documentation
 * The caller is responsible
 * @internal
 */
export interface FHEVMExecutorContractLib {
  getInputVerifierAddress(
    nativeClient: NativeClient,
    fhevmExecutorContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress>;
  getHCULimitAddress(
    nativeClient: NativeClient,
    fhevmExecutorContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress>;
  getACLAddress(
    nativeClient: NativeClient,
    fhevmExecutorContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress>;
  getHandleVersion(
    nativeClient: NativeClient,
    fhevmExecutorContractAddress: ChecksummedAddress,
  ): Promise<Uint8Number>;
}

/**
 * No public documentation
 * The caller is responsible
 * @internal
 */
export interface KMSVerifierContractLib {
  getKmsSigners(
    nativeClient: NativeClient,
    kmsVerifierContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress[]>;
  getThreshold(
    nativeClient: NativeClient,
    kmsVerifierContractAddress: ChecksummedAddress,
  ): Promise<unknown>;
  eip712Domain(
    nativeClient: NativeClient,
    kmsVerifierContractAddress: ChecksummedAddress,
  ): Promise<unknown[]>;
}

/**
 * No public documentation
 * The caller is responsible
 * @internal
 */
export interface EIP712Lib {
  recoverTypedDataAddress(params: {
    domain: {
      chainId: Uint256;
      name: string;
      verifyingContract: ChecksummedAddress;
      version: string;
    };
    types: Record<string, Array<{ name: string; type: string }>>;
    primaryType: string;
    message: Record<string, unknown>;
    signature: Bytes65Hex;
  }): Promise<ChecksummedAddress>;
}

/**
 * No public documentation
 * The caller is responsible
 * @internal
 */
export interface ABILib {
  encodePacked(params: {
    types: readonly string[];
    values: readonly unknown[];
  }): BytesHex;
  encode(params: {
    types: readonly string[];
    values: readonly unknown[];
  }): BytesHex;
  decode(params: {
    types: readonly string[];
    encodedData: BytesHex;
  }): unknown[];
}

/**
 * No public documentation
 * The caller is responsible
 * @internal
 */
export interface PublicClientLib {
  getChainId(nativeClient: NativeClient): Promise<bigint>;
}
