# Decrypt on behalf of another user

Delegate decryption lets an authorized address decrypt encrypted data on behalf of another user. The data owner (the **delegator**) holds the ACL permission for the encrypted value, while a separate address (the **delegate**) performs the actual decryption.

## When to use delegate decryption

Use delegate decryption when you need a different address to decrypt data that belongs to someone else. Common scenarios include:

- **Backend services** that decrypt user data to render a UI, without requiring the user to be online
- **Relaying wallets** or custodial setups where one address manages keys on behalf of another
- **Cross-contract workflows** where a contract or service needs to read encrypted values owned by a user

## How it differs from user decryption

| Aspect                           | User decryption                  | Delegate decryption                       |
| -------------------------------- | -------------------------------- | ----------------------------------------- |
| Who has ACL permission           | The decrypting user              | The delegator (data owner)                |
| Who signs the EIP-712 message    | The user                         | The delegate                              |
| Who receives the decrypted value | The user                         | The delegate                              |
| EIP-712 primary type             | `UserDecryptRequestVerification` | `DelegatedUserDecryptRequestVerification` |
| Relayer endpoint                 | `/user-decrypt`                  | `/delegated-user-decrypt`                 |

The key difference: the Zama Protocol checks ACL permissions against the **delegator** address, not the delegate. The delegate only needs to prove their identity by signing the request.

## Step 1: set up ACL permissions

The delegator's address must have ACL permission for the encrypted values. In your Solidity contract, use `FHE.allow()` to grant access to the delegator, and `FHE.allowThis()` to grant access to the contract itself (required for any decryption):

```solidity
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";

contract ConfidentialERC20 {
  mapping(address => euint64) internal balances;

  function transfer(address to, euint64 amount) public {
    // ... transfer logic ...
    FHE.allowThis(balances[to]); // required for decryption to work
    FHE.allow(balances[to], to); // grants ACL to the data owner (delegator)
  }
}
```

{% hint style="warning" %}
The ACL check verifies that the **delegator** (not the delegate) has permission on each encrypted value. Make sure your contract calls both `FHE.allowThis(ciphertext)` and `FHE.allow(ciphertext, delegatorAddress)`.
For more details, refer to [the ACL documentation](https://docs.zama.ai/protocol/solidity-guides/smart-contract/acl).
{% endhint %}

## Step 2: register the delegation

The delegator must authorize the delegate by calling `delegateForUserDecryption` on the `ACL` contract. This registers the delegation on-chain with an expiration date:

```ts
import { ethers } from 'ethers';

// The ACL contract address (check your chain's ZamaConfig for the correct address)
const ACL_ADDRESS = '0x...'; // chain-specific ACL address
const ACL_ABI = [
  'function delegateForUserDecryption(address delegate, address contractAddress, uint64 expirationDate) external',
];

// delegatorSigner: the delegator's (data owner's) ethers Signer
const acl = new ethers.Contract(ACL_ADDRESS, ACL_ABI, delegatorSigner);

// Authorize the delegate for 1 year
const expirationDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
const tx = await acl.delegateForUserDecryption(
  delegateAddress,
  contractAddress,
  expirationDate,
);
await tx.wait();
```

You can also register delegation from within a Solidity contract using `FHE.delegateUserDecryption()` or `FHE.delegateUserDecryptionWithoutExpiration()`. In that case, the contract itself becomes the delegator.

{% hint style="info" %}
The delegation is scoped to a specific `(delegator, delegate, contractAddress)` tuple. If the delegate needs to decrypt values from multiple contracts, the delegator must register a delegation for each contract address.
{% endhint %}

## Step 3: create the EIP-712 message (client-side)

Generate a keypair and build the EIP-712 typed data structure for delegate decryption. The `delegatorAddress` is included in the message to bind the delegation:

```ts
import { createInstance } from '@zama-fhe/relayer-sdk/node';

// instance: FhevmInstance (see initialization guide)
// delegatorAddress: the data owner's address
// contractAddress: the contract holding the encrypted value

const keypair = instance.generateKeypair();

// For production/testnet: use '0x00' as default extraData
// Future SDK versions may include getExtraData() for context-aware decryption
const extraData = '0x00';

const contractAddresses = [contractAddress];
const startTimestamp = Math.floor(Date.now() / 1000);
const durationDays = 10;

const eip712 = instance.createDelegatedUserDecryptEIP712(
  keypair.publicKey,
  contractAddresses,
  delegatorAddress,
  startTimestamp,
  durationDays,
  extraData,
);
```

{% hint style="info" %}
The `extraData` parameter is required for all delegate decryption requests. Use `'0x00'` as the default value. Future SDK versions may support context-aware decryption with dynamic `extraData` values fetched from `getExtraData()`.
{% endhint %}

## Step 4: sign as the delegate

The **delegate** signs the EIP-712 message. This proves that the delegate authorized the decryption request:

```ts
// delegateSigner: the delegate's ethers Signer
const signature = await delegateSigner.signTypedData(
  eip712.domain,
  {
    DelegatedUserDecryptRequestVerification:
      eip712.types.DelegatedUserDecryptRequestVerification,
  },
  eip712.message,
);
```

## Step 5: decrypt

Call `delegatedUserDecrypt` with the handle-contract pairs, keypair, signature, and both addresses. The function returns a map of handles to their decrypted values:

```ts
// Convert handle to proper hex format (32 bytes = 0x + 64 hex chars)
const handleHex = ethers.toBeHex(ciphertextHandle, 32);

const handleContractPairs = [
  {
    handle: handleHex,
    contractAddress: contractAddress,
  },
];

const result = await instance.delegatedUserDecrypt(
  handleContractPairs,
  keypair.privateKey,
  keypair.publicKey,
  signature.replace('0x', ''),
  contractAddresses,
  delegatorAddress,
  delegateAddress,
  startTimestamp,
  durationDays,
  extraData,
);

// result maps each handle to its decrypted value
const decryptedBalance = result[handleHex];
```

{% hint style="warning" %}
Ensure the handle is properly formatted as a 32-byte hex string (66 characters including `0x` prefix). If you receive a `BigInt` from your contract, convert it using `ethers.toBeHex(handle, 32)`.
{% endhint %}

{% hint style="info" %}
The total bit length of all ciphertexts being decrypted in a single request must not exceed 2048 bits. Each encrypted type has a specific bit length, for instance `euint8` uses 8 bits and `euint16` uses 16 bits. For the full list of encrypted types and their corresponding bit lengths, refer to the [encrypted types documentation](https://docs.zama.org/protocol/solidity-guides/smart-contract/types#list-of-encrypted-types).
{% endhint %}

## API reference

### `createDelegatedUserDecryptEIP712`

Creates the EIP-712 typed data structure for delegate decryption.

| Parameter           | Type       | Description                                              |
| ------------------- | ---------- | -------------------------------------------------------- |
| `publicKey`         | `string`   | The delegate's NaCl public key from `generateKeypair()`  |
| `contractAddresses` | `string[]` | Contract addresses holding the encrypted values (max 10) |
| `delegatorAddress`  | `string`   | The data owner's address (must have ACL permission)      |
| `startTimestamp`    | `number`   | Unix timestamp for when the permit becomes valid         |
| `durationDays`      | `number`   | How many days the permit remains valid (1–365)           |
| `extraData`         | `BytesHex` | KMS context from `getExtraData()`                        |

**Returns:** `KmsDelegatedUserDecryptEIP712Type` — the complete EIP-712 object with `domain`, `types`, and `message` fields.

### `delegatedUserDecrypt`

Performs the delegate decryption request through the Relayer.

| Parameter             | Type                            | Description                                               |
| --------------------- | ------------------------------- | --------------------------------------------------------- |
| `handleContractPairs` | `HandleContractPair[]`          | Array of `{ handle, contractAddress }` pairs to decrypt   |
| `privateKey`          | `string`                        | The delegate's NaCl private key from `generateKeypair()`  |
| `publicKey`           | `string`                        | The delegate's NaCl public key from `generateKeypair()`   |
| `signature`           | `string`                        | EIP-712 signature from the delegate (without `0x` prefix) |
| `contractAddresses`   | `string[]`                      | Same contract addresses used in the EIP-712 message       |
| `delegatorAddress`    | `string`                        | The data owner's address                                  |
| `delegateAddress`     | `string`                        | The delegate's address (the signer)                       |
| `startTimestamp`      | `number`                        | Same timestamp used in the EIP-712 message                |
| `durationDays`        | `number`                        | Same duration used in the EIP-712 message                 |
| `extraData`           | `BytesHex`                      | Same `extraData` used in the EIP-712 message              |
| `options`             | `RelayerUserDecryptOptionsType` | _(Optional)_ Request options (e.g., timeout)              |

**Returns:** `Promise<UserDecryptResults>` — a record mapping each handle (`0x${string}`) to its decrypted value (`bigint`, `boolean`, or `0x${string}`).

## Constraints

- **Maximum 10 contract addresses** per request.
- **Maximum 2048 encrypted bits** across all handles in a single request.
- **Permit duration** must be between 1 and 365 days.
- **Start timestamp** must not be in the future and must not have expired (`startTimestamp + durationDays >= now`).
- The **delegator** must have ACL permission on every handle — the delegate does not need ACL permission.
- The delegation must be **registered on-chain** via `ACL.delegateForUserDecryption()` before the delegate can decrypt.
- Delegation is scoped per `(delegator, delegate, contractAddress)` tuple.

## Complete working example

Here's a complete end-to-end example that has been tested on both localhost and Sepolia testnet:

```ts
import { ethers } from 'ethers';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/node';

async function delegateDecryptExample() {
  // Setup provider and signers
  const provider = new ethers.JsonRpcProvider(
    'https://ethereum-sepolia-rpc.publicnode.com',
  );
  const aliceSigner = new ethers.Wallet(ALICE_PRIVATE_KEY, provider);
  const bobSigner = new ethers.Wallet(BOB_PRIVATE_KEY, provider);

  const aliceAddr = await aliceSigner.getAddress();
  const bobAddr = await bobSigner.getAddress();

  // Initialize FHEVM instance with Sepolia config
  const fhevmInstance = await createInstance({
    ...SepoliaConfig,
    network: provider,
  });

  // Contract setup
  const contractAddress = '0x...'; // Your deployed contract address
  const contract = new ethers.Contract(
    contractAddress,
    [
      'function initialize(uint32 value) external',
      'function encryptedValue() public view returns (uint256)',
    ],
    aliceSigner,
  );

  // Step 1: Alice initializes encrypted value
  const tx1 = await contract.initialize(123456);
  await tx1.wait();

  // Step 2: Alice authorizes Bob as delegate
  const aclAddress = SepoliaConfig.aclContractAddress;
  const acl = new ethers.Contract(
    aclAddress,
    [
      'function delegateForUserDecryption(address delegate, address contractAddress, uint64 expirationDate) external',
    ],
    aliceSigner,
  );

  const expirationDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year
  const tx2 = await acl.delegateForUserDecryption(
    bobAddr,
    contractAddress,
    expirationDate,
  );
  await tx2.wait();

  // Step 3: Get encrypted handle and convert to hex
  const handleRaw = await contract.encryptedValue();
  const handleHex = ethers.toBeHex(handleRaw, 32);

  // Step 4: Bob generates keypair
  const bobKeypair = fhevmInstance.generateKeypair();

  // Step 5: Create EIP-712 message
  const extraData = '0x00';
  const startTimestamp = Math.floor(Date.now() / 1000);
  const durationDays = 10;

  const eip712 = fhevmInstance.createDelegatedUserDecryptEIP712(
    bobKeypair.publicKey,
    [contractAddress],
    aliceAddr,
    startTimestamp,
    durationDays,
    extraData,
  );

  // Step 6: Bob signs the message
  const signature = await bobSigner.signTypedData(
    eip712.domain,
    {
      DelegatedUserDecryptRequestVerification:
        eip712.types.DelegatedUserDecryptRequestVerification,
    },
    eip712.message,
  );

  // Step 7: Bob performs delegated decryption
  const results = await fhevmInstance.delegatedUserDecrypt(
    [{ handle: handleHex, contractAddress }],
    bobKeypair.privateKey,
    bobKeypair.publicKey,
    signature.replace('0x', ''),
    [contractAddress],
    aliceAddr,
    bobAddr,
    startTimestamp,
    durationDays,
    extraData,
  );

  const decryptedValue = results[handleHex];
  console.log('Decrypted value:', decryptedValue); // Output: 123457 (contract adds 1)
}
```

This example has been verified to work on:

- **Localhost**: Using hardhat mock relayer
- **Sepolia Testnet**: Using Zama's testnet relayer at `https://relayer.testnet.zama.org`
