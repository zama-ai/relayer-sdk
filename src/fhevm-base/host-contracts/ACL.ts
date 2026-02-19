import type { Bytes32Hex, ChecksummedAddress } from '@base/types/primitives';
import {
  assertIsChecksummedAddress,
  isChecksummedAddress,
} from '@base/address';
import { executeWithBatching } from '@base/promise';
import { ChecksummedAddressError } from '@base/errors/ChecksummedAddressError';
import type { FhevmChainClient } from '@fhevm-base-types/public-api';
import type { ACL, FhevmHandleLike } from '../types/public-api';
import {
  ACLPublicDecryptionError,
  ACLUserDecryptionError,
} from '../errors/ACLError';
import { assertIsFhevmHandleLike, toFhevmHandle } from '../FhevmHandle';

////////////////////////////////////////////////////////////////////////////////
// ACL
////////////////////////////////////////////////////////////////////////////////

class ACLImpl implements ACL {
  readonly #aclContractAddress: ChecksummedAddress;
  readonly #client: FhevmChainClient;
  #fhevmContractAddress: ChecksummedAddress | undefined;

  /**
   * Creates an ACL instance for checking decryption permissions.
   *
   * @param client - An abstract client
   * @param aclContractAddress - The checksummed address of the ACL contract
   * @param batchRpcCalls - Optional, execute RPC calls in parallel
   * @throws A {@link ChecksummedAddressError} If aclAddress is not a valid checksummed address
   * @throws A {@link ContractError} If provider is not provided
   */
  constructor(
    client: FhevmChainClient,
    {
      aclContractAddress,
    }: {
      aclContractAddress: ChecksummedAddress;
    },
  ) {
    if (!isChecksummedAddress(aclContractAddress)) {
      throw new ChecksummedAddressError({ address: aclContractAddress }, {});
    }
    this.#aclContractAddress = aclContractAddress;
    this.#client = client;
  }

  public async getFHEVMExecutorAddress(): Promise<ChecksummedAddress> {
    if (this.#fhevmContractAddress === undefined) {
      this.#fhevmContractAddress =
        await this.#client.libs.aclContractLib.getFHEVMExecutorAddress(
          this.#client.nativeClient,
          this.#aclContractAddress,
        );
    }
    return this.#fhevmContractAddress;
  }

  /**
   * Returns whether each handle is allowed for decryption.
   *
   * @throws A {@link FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   */
  public async isAllowedForDecryption(
    handles: FhevmHandleLike[],
    options?: { checkArguments?: boolean },
  ): Promise<boolean[]>;
  public async isAllowedForDecryption(
    handles: FhevmHandleLike,
    options?: { checkArguments?: boolean },
  ): Promise<boolean>;
  public async isAllowedForDecryption(
    handles: FhevmHandleLike[] | FhevmHandleLike,
    options: {
      checkArguments?: boolean;
    } = {
      checkArguments: true,
    },
  ): Promise<boolean[] | boolean> {
    const isArray = Array.isArray(handles);
    const handlesArray = isArray ? handles : [handles];

    if (options.checkArguments === true) {
      for (let i = 0; i < handlesArray.length; ++i) {
        assertIsFhevmHandleLike(handlesArray[i]);
      }
    }

    const rpcCalls = handlesArray.map(
      (h) => () =>
        this.#client.libs.aclContractLib.isAllowedForDecryption(
          this.#client.nativeClient,
          this.#aclContractAddress,
          {
            handle: toFhevmHandle(h).bytes32Hex,
          },
        ),
    );
    const results = await executeWithBatching(
      rpcCalls,
      this.#client.batchRpcCalls,
    );

    return isArray ? results : results[0];
  }

  /**
   * Throws ACLPublicDecryptionError if any handle is not allowed for decryption.
   *
   * @throws A {@link FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   * @throws A {@link ACLPublicDecryptionError} If any handle is not allowed for public decryption
   */
  public async checkAllowedForDecryption(
    handles: FhevmHandleLike[] | FhevmHandleLike,
    options: {
      checkArguments?: boolean;
    } = {
      checkArguments: true,
    },
  ): Promise<void> {
    const handlesArray = Array.isArray(handles) ? handles : [handles];
    const results = await this.isAllowedForDecryption(handlesArray, options);

    const failedHandles = handlesArray
      .filter((_, i) => !results[i])
      .map((h) => toFhevmHandle(h).bytes32Hex);
    if (failedHandles.length > 0) {
      throw new ACLPublicDecryptionError({
        contractAddress: this.#aclContractAddress,
        handles: failedHandles,
      });
    }
  }

  /**
   * Returns whether account is allowed to decrypt handle.
   *
   * @throws A {@link FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   * @throws A {@link ChecksummedAddressError} If checkArguments is true and any address is not a valid checksummed address
   */
  public async persistAllowed(
    handleAddressPairs: Array<{
      address: ChecksummedAddress;
      handle: FhevmHandleLike;
    }>,
    options?: { checkArguments?: boolean },
  ): Promise<boolean[]>;
  public async persistAllowed(
    handleAddressPairs: {
      address: ChecksummedAddress;
      handle: FhevmHandleLike;
    },
    options?: { checkArguments?: boolean },
  ): Promise<boolean>;
  public async persistAllowed(
    handleAddressPairs:
      | Array<{ address: ChecksummedAddress; handle: FhevmHandleLike }>
      | { address: ChecksummedAddress; handle: FhevmHandleLike },
    options: {
      checkArguments?: boolean;
    } = {
      checkArguments: true,
    },
  ): Promise<boolean[] | boolean> {
    const isArray = Array.isArray(handleAddressPairs);
    const handleAddressPairsArray = isArray
      ? handleAddressPairs
      : [handleAddressPairs];

    if (options.checkArguments === true) {
      for (const p of handleAddressPairsArray) {
        assertIsFhevmHandleLike(p.handle);
        assertIsChecksummedAddress(p.address, {});
      }
    }

    const rpcCalls = handleAddressPairsArray.map(
      (p) => () =>
        this.#client.libs.aclContractLib.persistAllowed(
          this.#client.nativeClient,
          this.#aclContractAddress,
          {
            handle: toFhevmHandle(p.handle).bytes32Hex,
            account: p.address,
          },
        ),
    );
    const results = await executeWithBatching(
      rpcCalls,
      this.#client.batchRpcCalls,
    );

    return isArray ? results : results[0];
  }

  /**
   * Verifies that a user is allowed to decrypt handles through specific contracts.
   *
   * For each (handle, contractAddress) pair, checks that:
   * 1. The userAddress has permission to decrypt the handle
   * 2. The contractAddress has permission to decrypt the handle
   * 3. The userAddress is not equal to any contractAddress
   *
   * @throws A {@link FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   * @throws A {@link ChecksummedAddressError} If checkArguments is true and any address is not a valid checksummed address
   * @throws A {@link ACLUserDecryptionError} If userAddress equals any contractAddress
   * @throws A {@link ACLUserDecryptionError} If user is not authorized to decrypt any handle
   * @throws A {@link ACLUserDecryptionError} If any contract is not authorized to decrypt its handle
   */
  public async checkUserAllowedForDecryption(
    params: {
      userAddress: ChecksummedAddress;
      handleContractPairs:
        | { contractAddress: ChecksummedAddress; handle: FhevmHandleLike }
        | Array<{
            contractAddress: ChecksummedAddress;
            handle: FhevmHandleLike;
          }>;
    },
    options: {
      checkArguments?: boolean;
    } = {
      checkArguments: true,
    },
  ): Promise<void> {
    const pairsArray = Array.isArray(params.handleContractPairs)
      ? params.handleContractPairs
      : [params.handleContractPairs];

    if (options.checkArguments === true) {
      assertIsChecksummedAddress(params.userAddress, {});
      for (const pair of pairsArray) {
        assertIsFhevmHandleLike(pair.handle);
        assertIsChecksummedAddress(pair.contractAddress, {});
      }
    }

    for (const pair of pairsArray) {
      if (
        params.userAddress.toLowerCase() === pair.contractAddress.toLowerCase()
      ) {
        throw new ACLUserDecryptionError({
          contractAddress: this.#aclContractAddress,
          message: `userAddress ${params.userAddress} should not be equal to contractAddress when requesting user decryption!`,
        });
      }
    }

    const pairsArrayHex: Array<{
      contractAddress: ChecksummedAddress;
      handleBytes32Hex: Bytes32Hex;
    }> = [];

    for (const pair of pairsArray) {
      pairsArrayHex.push({
        contractAddress: pair.contractAddress,
        handleBytes32Hex: toFhevmHandle(pair.handle).bytes32Hex,
      });
    }

    // Collect all unique (address, handle) pairs to avoid duplicate RPC calls
    const allChecks: Array<{
      address: ChecksummedAddress;
      handle: Bytes32Hex;
    }> = [];
    const seenKeys = new Set<string>();

    for (const pair of pairsArrayHex) {
      // User check
      const userKey = `${params.userAddress.toLowerCase()}:${pair.handleBytes32Hex}`;
      if (!seenKeys.has(userKey)) {
        seenKeys.add(userKey);
        allChecks.push({
          address: params.userAddress,
          handle: pair.handleBytes32Hex,
        });
      }
      // Contract check
      const contractKey = `${pair.contractAddress.toLowerCase()}:${pair.handleBytes32Hex}`;
      if (!seenKeys.has(contractKey)) {
        seenKeys.add(contractKey);
        allChecks.push({
          address: pair.contractAddress,
          handle: pair.handleBytes32Hex,
        });
      }
    }

    // Single batched RPC call for all unique checks
    const allResults = await this.persistAllowed(allChecks, {
      checkArguments: false,
    });

    // Build result map for lookup
    const resultMap = new Map<string, boolean>();
    for (let i = 0; i < allChecks.length; ++i) {
      const key = `${allChecks[i].address.toLowerCase()}:${allChecks[i].handle}`;
      resultMap.set(key, allResults[i]);
    }

    // Verify user permissions
    for (const pair of pairsArrayHex) {
      const userKey = `${params.userAddress.toLowerCase()}:${pair.handleBytes32Hex}`;
      if (resultMap.get(userKey) !== true) {
        throw new ACLUserDecryptionError({
          contractAddress: this.#aclContractAddress,
          message: `User ${params.userAddress} is not authorized to user decrypt handle ${pair.handleBytes32Hex}!`,
        });
      }
    }

    // Verify contract permissions
    for (const pair of pairsArrayHex) {
      const contractKey = `${pair.contractAddress.toLowerCase()}:${pair.handleBytes32Hex}`;
      if (resultMap.get(contractKey) !== true) {
        throw new ACLUserDecryptionError({
          contractAddress: this.#aclContractAddress,
          message: `dapp contract ${pair.contractAddress} is not authorized to user decrypt handle ${pair.handleBytes32Hex}!`,
        });
      }
    }
  }
}

export function createACL(
  client: FhevmChainClient & {
    config: { hostChainConfig: { aclContractAddress: ChecksummedAddress } };
  },
): ACL {
  return new ACLImpl(client, {
    aclContractAddress: client.config.hostChainConfig.aclContractAddress,
  });
}
