import type { ethers as EthersT } from 'ethers';
import type { Bytes32Hex, ChecksummedAddress } from '@base/types/primitives';
import type { FhevmHandleLike } from './FhevmHandle';
import { Contract } from 'ethers';
import {
  assertIsChecksummedAddress,
  isChecksummedAddress,
} from '@base/address';
import {
  ACLPublicDecryptionError,
  ACLUserDecryptionError,
} from '../errors/ACLError';
import { ChecksummedAddressError } from '../errors/ChecksummedAddressError';
import { ContractError } from '../errors/ContractErrorBase';
import { FhevmHandle, toHandleBytes32Hex } from './FhevmHandle';

////////////////////////////////////////////////////////////////////////////////
// ACL
////////////////////////////////////////////////////////////////////////////////

interface IACL {
  persistAllowed(
    handle: Bytes32Hex,
    account: ChecksummedAddress,
  ): Promise<boolean>;
  isAllowedForDecryption(handle: Bytes32Hex): Promise<boolean>;
}

export class ACL {
  readonly #aclAddress: ChecksummedAddress;
  readonly #contract: IACL;

  static readonly #abi = [
    'function persistAllowed(bytes32 handle, address account) view returns (bool)',
    'function isAllowedForDecryption(bytes32 handle) view returns (bool)',
  ] as const;

  static {
    Object.freeze(ACL.#abi);
  }

  /**
   * Creates an ACL instance for checking decryption permissions.
   *
   * @param aclAddress - The checksummed address of the ACL contract
   * @param provider - An ethers ContractRunner (provider or signer) for contract interactions
   * @throws {ChecksummedAddressError} If aclAddress is not a valid checksummed address
   * @throws {ContractError} If provider is not provided
   */
  public constructor(
    aclAddress: ChecksummedAddress,
    provider: EthersT.ContractRunner,
  ) {
    if (!isChecksummedAddress(aclAddress)) {
      throw new ChecksummedAddressError({ address: aclAddress });
    }
    if ((provider as unknown) === undefined || (provider as unknown) === null) {
      throw new ContractError({
        contractAddress: aclAddress,
        contractName: 'ACL',
        message: 'Invalid provider.',
      });
    }
    this.#aclAddress = aclAddress;
    this.#contract = new Contract(
      this.#aclAddress,
      ACL.#abi,
      provider,
    ) as unknown as IACL;
  }

  /**
   * Returns whether each handle is allowed for decryption.
   *
   * @throws {FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
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
        FhevmHandle.assertIsHandleLike(handlesArray[i]);
      }
    }

    const results: boolean[] = (await Promise.all(
      handlesArray.map((h) => {
        return this.#contract.isAllowedForDecryption(toHandleBytes32Hex(h));
      }),
    )) as unknown[] as boolean[];

    return isArray ? results : results[0];
  }

  /**
   * Throws ACLPublicDecryptionError if any handle is not allowed for decryption.
   *
   * @throws {FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   * @throws {ACLPublicDecryptionError} If any handle is not allowed for public decryption
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
      .map(toHandleBytes32Hex);
    if (failedHandles.length > 0) {
      throw new ACLPublicDecryptionError({
        contractAddress: this.#aclAddress,
        handles: failedHandles,
      });
    }
  }

  /**
   * Returns whether account is allowed to decrypt handle.
   *
   * @throws {FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   * @throws {ChecksummedAddressError} If checkArguments is true and any address is not a valid checksummed address
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
        FhevmHandle.assertIsHandleLike(p.handle);
        assertIsChecksummedAddress(p.address);
      }
    }

    const results = (await Promise.all(
      handleAddressPairsArray.map((p) =>
        this.#contract.persistAllowed(toHandleBytes32Hex(p.handle), p.address),
      ),
    )) as unknown[] as boolean[];

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
   * @throws {FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   * @throws {ChecksummedAddressError} If checkArguments is true and any address is not a valid checksummed address
   * @throws {ACLUserDecryptionError} If userAddress equals any contractAddress
   * @throws {ACLUserDecryptionError} If user is not authorized to decrypt any handle
   * @throws {ACLUserDecryptionError} If any contract is not authorized to decrypt its handle
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
      assertIsChecksummedAddress(params.userAddress);
      for (const pair of pairsArray) {
        FhevmHandle.assertIsHandleLike(pair.handle);
        assertIsChecksummedAddress(pair.contractAddress);
      }
    }

    for (const pair of pairsArray) {
      if (params.userAddress === pair.contractAddress) {
        throw new ACLUserDecryptionError({
          contractAddress: this.#aclAddress,
          message: `userAddress ${params.userAddress} should not be equal to contractAddress when requesting user decryption!`,
        });
      }
    }

    // Collect all unique (address, handle) pairs to avoid duplicate RPC calls
    const allChecks: Array<{
      address: ChecksummedAddress;
      handle: Bytes32Hex;
    }> = [];
    const seenKeys = new Set<string>();

    for (const pair of pairsArray) {
      // User check
      const userKey = `${params.userAddress.toLowerCase()}:${pair.handle}`;
      if (!seenKeys.has(userKey)) {
        seenKeys.add(userKey);
        allChecks.push({
          address: params.userAddress,
          handle: toHandleBytes32Hex(pair.handle),
        });
      }
      // Contract check
      const contractKey = `${pair.contractAddress.toLowerCase()}:${pair.handle}`;
      if (!seenKeys.has(contractKey)) {
        seenKeys.add(contractKey);
        allChecks.push({
          address: pair.contractAddress,
          handle: toHandleBytes32Hex(pair.handle),
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
    for (const pair of pairsArray) {
      const userKey = `${params.userAddress.toLowerCase()}:${pair.handle}`;
      if (resultMap.get(userKey) !== true) {
        throw new ACLUserDecryptionError({
          contractAddress: this.#aclAddress,
          message: `User ${params.userAddress} is not authorized to user decrypt handle ${pair.handle}!`,
        });
      }
    }

    // Verify contract permissions
    for (const pair of pairsArray) {
      const contractKey = `${pair.contractAddress.toLowerCase()}:${pair.handle}`;
      if (resultMap.get(contractKey) !== true) {
        throw new ACLUserDecryptionError({
          contractAddress: this.#aclAddress,
          message: `dapp contract ${pair.contractAddress} is not authorized to user decrypt handle ${pair.handle}!`,
        });
      }
    }
  }
}
