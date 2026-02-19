import { Contract, verifyTypedData, solidityPacked, AbiCoder } from 'ethers';
import { ethers as EthersT } from 'ethers';
import type {
  ChecksummedAddress,
  Bytes32Hex,
  Uint256,
  Bytes65Hex,
  BytesHex,
  Uint8Number,
} from '@base/types/primitives';
import type {
  ABILib,
  ACLContractLib,
  createFhevmLibsFn,
  EIP712Lib,
  FhevmLibs,
  InputVerifierContractLib,
  KMSVerifierContractLib,
  PublicClientLib,
  NativeClient,
  FHEVMExecutorContractLib,
} from '@fhevm-base-types/public-api';
import { asChecksummedAddress } from '@base/address';

/**
 * Cast unknown nativeClient to ethers ContractRunner
 */
function asContractRunner(nativeClient: NativeClient): EthersT.ContractRunner {
  // TODO: Add runtime validation
  return nativeClient as EthersT.ContractRunner;
}

/**
 * Get ethers Network from an unknown nativeClient.
 * Supports Provider (has getNetwork) and ContractRunner (via its provider).
 */
async function getNetwork(
  nativeClient: NativeClient,
): Promise<EthersT.Network> {
  if (
    typeof nativeClient === 'object' &&
    nativeClient !== null &&
    'getNetwork' in nativeClient &&
    typeof (nativeClient as Record<string, unknown>).getNetwork === 'function'
  ) {
    return await (nativeClient as EthersT.Provider).getNetwork();
  }

  const runner = asContractRunner(nativeClient);
  if (runner.provider != null) {
    return await runner.provider.getNetwork();
  }

  throw new Error(
    'Cannot get network: nativeClient is neither a Provider nor a ContractRunner with a provider.',
  );
}

////////////////////////////////////////////////////////////////////////////////
// ACL
////////////////////////////////////////////////////////////////////////////////

interface ACLContract {
  persistAllowed(
    handle: Bytes32Hex,
    account: ChecksummedAddress,
  ): Promise<boolean>;
  isAllowedForDecryption(handle: Bytes32Hex): Promise<boolean>;
  getFHEVMExecutorAddress(): Promise<ChecksummedAddress>;
}

function getACLContract(
  nativeClient: NativeClient,
  aclContractAddress: ChecksummedAddress,
): ACLContract {
  const runner = asContractRunner(nativeClient);
  return new Contract(
    aclContractAddress,
    ACLPartialInterface,
    runner,
  ) as unknown as ACLContract;
}

const aclContractLib: ACLContractLib = {
  async persistAllowed(
    nativeClient: NativeClient,
    aclContractAddress: ChecksummedAddress,
    args: {
      handle: Bytes32Hex;
      account: ChecksummedAddress;
    },
  ): Promise<boolean> {
    return await getACLContract(
      nativeClient,
      aclContractAddress,
    ).persistAllowed(args.handle, args.account);
  },

  async isAllowedForDecryption(
    nativeClient: NativeClient,
    aclContractAddress: ChecksummedAddress,
    args: {
      handle: Bytes32Hex;
    },
  ): Promise<boolean> {
    return await getACLContract(
      nativeClient,
      aclContractAddress,
    ).isAllowedForDecryption(args.handle);
  },

  async getFHEVMExecutorAddress(
    nativeClient: NativeClient,
    aclContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress> {
    return await getACLContract(
      nativeClient,
      aclContractAddress,
    ).getFHEVMExecutorAddress();
  },
};

////////////////////////////////////////////////////////////////////////////////
// InputVerifier
////////////////////////////////////////////////////////////////////////////////

interface InputVerifierContract {
  getCoprocessorSigners(): Promise<ChecksummedAddress[]>;
  getThreshold(): Promise<unknown>;
  eip712Domain(): Promise<unknown[]>;
}

function getInputVerifierContract(
  nativeClient: NativeClient,
  inputVerifierContractAddress: ChecksummedAddress,
): InputVerifierContract {
  const runner = asContractRunner(nativeClient);
  return new Contract(
    inputVerifierContractAddress,
    InputVerifierPartialInterface,
    runner,
  ) as unknown as InputVerifierContract;
}

const inputVerifierContractLib: InputVerifierContractLib = {
  async getCoprocessorSigners(
    nativeClient: NativeClient,
    inputVerifierContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress[]> {
    return await getInputVerifierContract(
      nativeClient,
      inputVerifierContractAddress,
    ).getCoprocessorSigners();
  },

  async getThreshold(
    nativeClient: NativeClient,
    inputVerifierContractAddress: ChecksummedAddress,
  ): Promise<unknown> {
    return await getInputVerifierContract(
      nativeClient,
      inputVerifierContractAddress,
    ).getThreshold();
  },

  async eip712Domain(
    nativeClient: NativeClient,
    inputVerifierContractAddress: ChecksummedAddress,
  ): Promise<unknown[]> {
    return await getInputVerifierContract(
      nativeClient,
      inputVerifierContractAddress,
    ).eip712Domain();
  },
};

////////////////////////////////////////////////////////////////////////////////
// KMSVerifier
////////////////////////////////////////////////////////////////////////////////

interface KMSVerifierContract {
  getKmsSigners(): Promise<ChecksummedAddress[]>;
  getThreshold(): Promise<unknown>;
  eip712Domain(): Promise<unknown[]>;
}

function getKmsVerifierContract(
  nativeClient: NativeClient,
  kmsVerifierContractAddress: ChecksummedAddress,
): KMSVerifierContract {
  const runner = asContractRunner(nativeClient);
  return new Contract(
    kmsVerifierContractAddress,
    KMSVerifierPartialInterface,
    runner,
  ) as unknown as KMSVerifierContract;
}

const kmsVerifierContractLib: KMSVerifierContractLib = {
  async getKmsSigners(
    nativeClient: NativeClient,
    kmsVerifierContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress[]> {
    return await getKmsVerifierContract(
      nativeClient,
      kmsVerifierContractAddress,
    ).getKmsSigners();
  },

  async getThreshold(
    nativeClient: NativeClient,
    kmsVerifierContractAddress: ChecksummedAddress,
  ): Promise<unknown> {
    return await getKmsVerifierContract(
      nativeClient,
      kmsVerifierContractAddress,
    ).getThreshold();
  },

  async eip712Domain(
    nativeClient: NativeClient,
    kmsVerifierContractAddress: ChecksummedAddress,
  ): Promise<unknown[]> {
    return await getKmsVerifierContract(
      nativeClient,
      kmsVerifierContractAddress,
    ).eip712Domain();
  },
};

////////////////////////////////////////////////////////////////////////////////
// FHEVMExecutor
////////////////////////////////////////////////////////////////////////////////

interface FHEVMExecutorContract {
  getInputVerifierAddress(): Promise<ChecksummedAddress>;
  getACLAddress(): Promise<ChecksummedAddress>;
  getHCULimitAddress(): Promise<ChecksummedAddress>;
  getHandleVersion(): Promise<Uint8Number>;
}

function getFHEVMExecutorContract(
  nativeClient: NativeClient,
  fhevmExecutorContractAddress: ChecksummedAddress,
): FHEVMExecutorContract {
  const runner = asContractRunner(nativeClient);
  return new Contract(
    fhevmExecutorContractAddress,
    FHEVMExecutorPartialInterface,
    runner,
  ) as unknown as FHEVMExecutorContract;
}

const fhevmExecutorContractLib: FHEVMExecutorContractLib = {
  async getInputVerifierAddress(
    nativeClient: NativeClient,
    fhevmExecutorContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress> {
    return await getFHEVMExecutorContract(
      nativeClient,
      fhevmExecutorContractAddress,
    ).getInputVerifierAddress();
  },
  async getACLAddress(
    nativeClient: NativeClient,
    fhevmExecutorContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress> {
    return await getFHEVMExecutorContract(
      nativeClient,
      fhevmExecutorContractAddress,
    ).getACLAddress();
  },
  async getHCULimitAddress(
    nativeClient: NativeClient,
    fhevmExecutorContractAddress: ChecksummedAddress,
  ): Promise<ChecksummedAddress> {
    return await getFHEVMExecutorContract(
      nativeClient,
      fhevmExecutorContractAddress,
    ).getHCULimitAddress();
  },
  async getHandleVersion(
    nativeClient: NativeClient,
    fhevmExecutorContractAddress: ChecksummedAddress,
  ): Promise<Uint8Number> {
    return await getFHEVMExecutorContract(
      nativeClient,
      fhevmExecutorContractAddress,
    ).getHandleVersion();
  },
};

////////////////////////////////////////////////////////////////////////////////
// EIP712
////////////////////////////////////////////////////////////////////////////////

const eip712Lib: EIP712Lib = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async recoverTypedDataAddress(params: {
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
  }): Promise<ChecksummedAddress> {
    const { primaryType, types, domain, message, signature } = params;
    // If primaryType is specified, filter types to only include the primary type
    // This ensures ethers uses the correct primary type for signing
    const typesToSign =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      primaryType !== undefined ? { [primaryType]: types[primaryType] } : types;

    const recoveredAddress = verifyTypedData(
      domain,
      typesToSign,
      message,
      signature,
    );

    return asChecksummedAddress(recoveredAddress);
  },
};

////////////////////////////////////////////////////////////////////////////////
// ABI
////////////////////////////////////////////////////////////////////////////////

const abiLib: ABILib = {
  encodePacked(params: {
    types: readonly string[];
    values: readonly unknown[];
  }): BytesHex {
    return solidityPacked(params.types, params.values) as BytesHex;
  },
  encode(params: {
    types: readonly string[];
    values: readonly unknown[];
  }): BytesHex {
    const abiCoder = AbiCoder.defaultAbiCoder();
    return abiCoder.encode(params.types, params.values) as BytesHex;
  },
  decode(params: {
    types: readonly string[];
    encodedData: BytesHex;
  }): unknown[] {
    const abiCoder = AbiCoder.defaultAbiCoder();
    return abiCoder.decode(params.types, params.encodedData);
  },
};

////////////////////////////////////////////////////////////////////////////////
// ABI
////////////////////////////////////////////////////////////////////////////////

const publicClientLib: PublicClientLib = {
  async getChainId(nativeClient: unknown): Promise<bigint> {
    const n = await getNetwork(nativeClient);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
    return BigInt(n.chainId);
  },
};

////////////////////////////////////////////////////////////////////////////////
// createFhevmLibs
////////////////////////////////////////////////////////////////////////////////

export const createFhevmLibs: createFhevmLibsFn = async (
  _config?: unknown,
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<FhevmLibs> => {
  return {
    aclContractLib,
    inputVerifierContractLib,
    kmsVerifierContractLib,
    fhevmExecutorContractLib,
    eip712Lib,
    abiLib,
    publicClientLib,
  };
};

////////////////////////////////////////////////////////////////////////////////
// ACL ABI
////////////////////////////////////////////////////////////////////////////////

const ACLPartialInterface: EthersT.Interface = new EthersT.Interface([
  {
    inputs: [],
    name: 'getFHEVMExecutorAddress',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'handle',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'persistAllowed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'handle',
        type: 'bytes32',
      },
    ],
    name: 'isAllowedForDecryption',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]);

////////////////////////////////////////////////////////////////////////////////
// InputVerifier ABI
////////////////////////////////////////////////////////////////////////////////

const InputVerifierPartialInterface: EthersT.Interface = new EthersT.Interface([
  {
    inputs: [],
    name: 'getThreshold',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      {
        internalType: 'bytes1',
        name: 'fields',
        type: 'bytes1',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'version',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'verifyingContract',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'uint256[]',
        name: 'extensions',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCoprocessorSigners',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]);

////////////////////////////////////////////////////////////////////////////////
// KMSVerifier ABI
////////////////////////////////////////////////////////////////////////////////

const KMSVerifierPartialInterface: EthersT.Interface = new EthersT.Interface([
  {
    inputs: [],
    name: 'getKmsSigners',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getThreshold',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      {
        internalType: 'bytes1',
        name: 'fields',
        type: 'bytes1',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'version',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'verifyingContract',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'uint256[]',
        name: 'extensions',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]);

////////////////////////////////////////////////////////////////////////////////
// FHEVMExecutor ABI
////////////////////////////////////////////////////////////////////////////////

const FHEVMExecutorPartialInterface: EthersT.Interface = new EthersT.Interface(
  [],
);
