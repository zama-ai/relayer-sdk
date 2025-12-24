import { Contract } from 'ethers';
import type { ethers as EthersT } from 'ethers';
import { Bytes32Hex, ChecksummedAddress } from '../types/primitives';
import {
  assertIsChecksummedAddress,
  isChecksummedAddress,
} from '../utils/address';
import { ChecksummedAddressError } from '../errors/ChecksummedAddressError';
import {
  ACLPublicDecryptionError,
  ACLUserDecryptionError,
} from '../errors/ACLError';
import { ContractError } from '../errors/ContractErrorBase';
import { FhevmHandle } from './FhevmHandle';

////////////////////////////////////////////////////////////////////////////////
// ACL
////////////////////////////////////////////////////////////////////////////////

export class ACL {
  private readonly _aclAddress: ChecksummedAddress;
  private readonly _contract: Contract;

  private static readonly aclABI = [
    'function persistAllowed(bytes32 handle, address account) view returns (bool)',
    'function isAllowedForDecryption(bytes32 handle) view returns (bool)',
  ] as const;

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
    if (!provider) {
      throw new ContractError({
        contractAddress: aclAddress,
        contractName: 'ACL',
        message: 'Invalid provider.',
      });
    }
    this._aclAddress = aclAddress;
    this._contract = new Contract(this._aclAddress, ACL.aclABI, provider);
  }

  /**
   * Returns whether each handle is allowed for decryption.
   *
   * @throws {FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   */
  public async isAllowedForDecryption(
    handles: Bytes32Hex[],
    options?: { checkArguments?: boolean },
  ): Promise<boolean[]>;
  public async isAllowedForDecryption(
    handles: Bytes32Hex,
    options?: { checkArguments?: boolean },
  ): Promise<boolean>;
  public async isAllowedForDecryption(
    handles: Bytes32Hex[] | Bytes32Hex,
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
        FhevmHandle.assertIsHandleHex(handlesArray[i]);
      }
    }

    const results = await Promise.all(
      handlesArray.map((h) => this._contract.isAllowedForDecryption(h)),
    );

    return isArray ? results : results[0];
  }

  /**
   * Throws ACLPublicDecryptionError if any handle is not allowed for decryption.
   *
   * @throws {FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   * @throws {ACLPublicDecryptionError} If any handle is not allowed for public decryption
   */
  public async checkAllowedForDecryption(
    handles: Bytes32Hex[],
    options?: { checkArguments?: boolean },
  ): Promise<void>;
  public async checkAllowedForDecryption(
    handles: Bytes32Hex,
    options?: { checkArguments?: boolean },
  ): Promise<void>;
  public async checkAllowedForDecryption(
    handles: Bytes32Hex[] | Bytes32Hex,
    options: {
      checkArguments?: boolean;
    } = {
      checkArguments: true,
    },
  ): Promise<void> {
    const handlesArray = Array.isArray(handles) ? handles : [handles];
    const results = await this.isAllowedForDecryption(handlesArray, options);

    const failedHandles = handlesArray.filter((_, i) => !results[i]);
    if (failedHandles.length > 0) {
      throw new ACLPublicDecryptionError({
        contractAddress: this._aclAddress,
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
    handleAddressPairs: { address: ChecksummedAddress; handle: Bytes32Hex }[],
    options?: { checkArguments?: boolean },
  ): Promise<boolean[]>;
  public async persistAllowed(
    handleAddressPairs: { address: ChecksummedAddress; handle: Bytes32Hex },
    options?: { checkArguments?: boolean },
  ): Promise<boolean>;
  public async persistAllowed(
    handleAddressPairs:
      | { address: ChecksummedAddress; handle: Bytes32Hex }[]
      | { address: ChecksummedAddress; handle: Bytes32Hex },
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
        FhevmHandle.assertIsHandleHex(p.handle);
        assertIsChecksummedAddress(p.address);
      }
    }

    const results = await Promise.all(
      handleAddressPairsArray.map((p) =>
        this._contract.persistAllowed(p.handle, p.address),
      ),
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
   * @throws {FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
   * @throws {ChecksummedAddressError} If checkArguments is true and any address is not a valid checksummed address
   * @throws {ACLUserDecryptionError} If userAddress equals any contractAddress
   * @throws {ACLUserDecryptionError} If user is not authorized to decrypt any handle
   * @throws {ACLUserDecryptionError} If any contract is not authorized to decrypt its handle
   */
  public async checkUserAllowedForDecryption(
    params: {
      userAddress: ChecksummedAddress;
      handleContractPairs: {
        contractAddress: ChecksummedAddress;
        handle: Bytes32Hex;
      };
    },
    options?: { checkArguments?: boolean },
  ): Promise<void>;
  public async checkUserAllowedForDecryption(
    params: {
      userAddress: ChecksummedAddress;
      handleContractPairs: {
        contractAddress: ChecksummedAddress;
        handle: Bytes32Hex;
      }[];
    },
    options?: { checkArguments?: boolean },
  ): Promise<void>;
  public async checkUserAllowedForDecryption(
    params: {
      userAddress: ChecksummedAddress;
      handleContractPairs:
        | { contractAddress: ChecksummedAddress; handle: Bytes32Hex }
        | { contractAddress: ChecksummedAddress; handle: Bytes32Hex }[];
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
        FhevmHandle.assertIsHandleHex(pair.handle);
        assertIsChecksummedAddress(pair.contractAddress);
      }
    }

    for (const pair of pairsArray) {
      if (params.userAddress === pair.contractAddress) {
        throw new ACLUserDecryptionError({
          contractAddress: this._aclAddress,
          message: `userAddress ${params.userAddress} should not be equal to contractAddress when requesting user decryption!`,
        });
      }
    }

    // Collect all unique (address, handle) pairs to avoid duplicate RPC calls
    const allChecks: { address: ChecksummedAddress; handle: Bytes32Hex }[] = [];
    const seenKeys = new Set<string>();

    for (const pair of pairsArray) {
      // User check
      const userKey = `${params.userAddress.toLowerCase()}:${pair.handle}`;
      if (!seenKeys.has(userKey)) {
        seenKeys.add(userKey);
        allChecks.push({ address: params.userAddress, handle: pair.handle });
      }
      // Contract check
      const contractKey = `${pair.contractAddress.toLowerCase()}:${pair.handle}`;
      if (!seenKeys.has(contractKey)) {
        seenKeys.add(contractKey);
        allChecks.push({ address: pair.contractAddress, handle: pair.handle });
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
      if (!resultMap.get(userKey)) {
        throw new ACLUserDecryptionError({
          contractAddress: this._aclAddress,
          message: `User ${params.userAddress} is not authorized to user decrypt handle ${pair.handle}!`,
        });
      }
    }

    // Verify contract permissions
    for (const pair of pairsArray) {
      const contractKey = `${pair.contractAddress.toLowerCase()}:${pair.handle}`;
      if (!resultMap.get(contractKey)) {
        throw new ACLUserDecryptionError({
          contractAddress: this._aclAddress,
          message: `dapp contract ${pair.contractAddress} is not authorized to user decrypt handle ${pair.handle}!`,
        });
      }
    }
  }
}
