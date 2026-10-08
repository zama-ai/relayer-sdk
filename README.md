<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/zama-ai/fhevm/main/docs/.gitbook/assets/fhevm-header-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/zama-ai/fhevm/main/docs/.gitbook/assets/fhevm-header-light.png">
  <img src="https://raw.githubusercontent.com/zama-ai/fhevm/main/docs/.gitbook/assets/fhevm-header-light.png" width="600" alt="FHEVM">
</picture>
</p>

<hr/>
<p align="center">
  <a href="https://docs.zama.org/protocol/zama-protocol-litepaper">📃 Read white paper</a> | <a href="https://docs.zama.org/protocol/sdk">📒 Read the Zama SDK documentation</a> | <a href="https://zama.ai/community">💛 Community support</a>
</p>
<p align="center">
<!-- Version badge using shields.io -->
  <a href="https://github.com/zama-ai/relayer-sdk/releases"><img src="https://img.shields.io/github/v/release/zama-ai/relayer-sdk?style=flat-square"/></a>
</p>
<hr/>

## Deprecation notice

> [!WARNING]
> **`@zama-fhe/relayer-sdk` is deprecated. Please migrate to the Zama SDK**, the default SDK for the Zama Protocol. The Relayer SDK will no longer be maintained from **6 November 2026**.

### Migrate to the Zama SDK

| Package                                                                    | Use it for                                                                             |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`@zama-fhe/sdk`](https://www.npmjs.com/package/@zama-fhe/sdk)             | Core TypeScript SDK for any JavaScript/TypeScript app. Works with viem or ethers.      |
| [`@zama-fhe/react-sdk`](https://www.npmjs.com/package/@zama-fhe/react-sdk) | React hooks built on top of the core SDK. Use this if you are building a React/Next.js app. |

```bash
# Core SDK
npm install @zama-fhe/sdk

# React hooks (also requires @tanstack/react-query)
npm install @zama-fhe/react-sdk @tanstack/react-query
```

- 📒 **Documentation:** [docs.zama.org/protocol/sdk](https://docs.zama.org/protocol/sdk)
- 🚀 **Quick start:** [Get started with the Zama SDK](https://docs.zama.org/protocol/sdk/getting-started/quick-start)
- 💻 **Source code:** [github.com/zama-ai/sdk](https://github.com/zama-ai/sdk)

### What this means for you

- Until 6 November 2026, the Relayer SDK only receives dependency security updates: no new features, bug fixes, or protocol updates.
- From 6 November 2026, it will no longer be maintained.
- Existing installs keep working: the package stays available on npm, so your current builds will not break immediately.
- We recommend migrating as soon as possible.

### Need help?

Ask questions in the [Zama community](https://zama.ai/community) or reach us at [hello@zama.ai](mailto:hello@zama.ai).

## License

This software is distributed under the BSD-3-Clause-Clear license. If you have any questions, please contact us at [hello@zama.ai](mailto:hello@zama.ai).
