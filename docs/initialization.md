# Setup

The use of `@zama-fhe/relayer-sdk` requires a setup phase.
This consists of the instantiation of the `FhevmInstance`.
This object holds all the configuration and methods needed to interact with an FHEVM using a Relayer.
It can be created using the following code snippet:

```ts
import { createInstance } from '@zama-fhe/relayer-sdk';

const instance = await createInstance({
  // ACL_CONTRACT_ADDRESS (FHEVM Host chain)
  aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
  // KMS_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
  kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
  // INPUT_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
  inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
  // DECRYPTION_ADDRESS (Gateway chain)
  verifyingContractAddressDecryption:
    '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
  // INPUT_VERIFICATION_ADDRESS (Gateway chain)
  verifyingContractAddressInputVerification:
    '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
  // FHEVM Host chain id
  chainId: 11155111,
  // Gateway chain id
  gatewayChainId: 10901,
  // RPC provider to host chain (or Eip1193Provider)
  network: 'https://ethereum-sepolia-rpc.publicnode.com',
  // Relayer URL
  relayerUrl: 'https://relayer.testnet.zama.org',
});
```

or the even simpler:

```ts
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk';

const instance = await createInstance({
  ...SepoliaConfig,
  network: 'https://ethereum-sepolia-rpc.publicnode.com',
});
```

## Sepolia

The information regarding the configuration of Sepolia's FHEVM and associated Relayer maintained by Zama can be found in the `SepoliaConfig` object or in the [contract addresses page](https://docs.zama.ai/protocol/solidity-guides/smart-contract/configure/contract_addresses).
The `gatewayChainId` is `10901`.
The `chainId` is the chain-id of the FHEVM chain, so for Sepolia it would be `11155111`.

## Mainnet

The information regarding the configuration of Mainnet's FHEVM and associated Relayer maintained by Zama can be found in the `MainnetConfig` object or in the [contract addresses page](https://docs.zama.ai/protocol/solidity-guides/smart-contract/configure/contract_addresses).
The `gatewayChainId` is `261131`.
The `chainId` is the chain-id of the FHEVM chain, so for Mainnet it would be `1`.

{% hint style="info" %}
For more information on the Relayer's par, please refer to [the Relayer SDK documentation](https://docs.zama.org/protocol/relayer-sdk-guides).
{% endhint %}

# Network Configuration

The `network` property in `FhevmInstanceConfig` is required and specifies how the SDK connects to the FHEVM host chain. It accepts two types of values:

## RPC URL String

A valid RPC endpoint URL as a string:

```ts
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk';

const instance = await createInstance({
  ...SepoliaConfig,
  network: 'https://ethereum-sepolia-rpc.publicnode.com',
});
```

## Eip1193Provider Instance

An object implementing the `ethers.Eip1193Provider` interface. This is useful when integrating with browser wallets like MetaMask:

```ts
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk';

// Using window.ethereum from MetaMask or other browser wallets
const instance = await createInstance({
  ...SepoliaConfig,
  network: window.ethereum, // Eip1193Provider
});
```

{% hint style="warning" %}
The `network` property is mandatory. If omitted or invalid, the SDK will throw an error.
{% endhint %}
