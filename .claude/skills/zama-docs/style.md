# Style conventions

## Heading capitalization

Use **sentence case** for all headings. Capitalize only the first word and proper nouns. Never use title case.

```markdown
# Getting started
## Where to go next
### Create a client
### Supported types
### How it works
```

Never:
```markdown
# Getting Started
## Where To Go Next
### Create A Client
```

## Product and technology naming

These are the exact spellings used in official Zama documentation. Follow them precisely.

### Zama products and protocols

| Term | Correct | Never |
| --- | --- | --- |
| The protocol | **Zama Protocol** | zama protocol, ZAMA Protocol |
| The company | **Zama** | zama, ZAMA |
| The FHE virtual machine | **FHEVM** | fhEVM, fhevm, FhEVM, Fhevm |
| The Solidity library | **FHEVM Solidity** | fhevm-solidity |
| The SDK (prose) | **the FHEVM SDK** or **the SDK** | the fhevm sdk |
| The SDK (code) | `@fhevm/sdk` | — |
| The relayer SDK | **Relayer SDK** | relayer sdk, RelayerSDK |
| Rust library | **TFHE-rs** | tfhe-rs, TFHE-RS |
| TFHE compiler | **Concrete** | concrete |
| ML library | **Concrete ML** | concrete ml |

### Cryptography and protocol terms

| Term | Correct | Notes |
| --- | --- | --- |
| Fully Homomorphic Encryption | **FHE** | Always all caps. Spell out on first use: "Fully Homomorphic Encryption (FHE)" |
| Torus FHE | **TFHE** | Always all caps |
| TKMS | **TKMS** | Always all caps (the decryption key management WASM module) |
| Key Management System | **KMS** | Always all caps |
| Access Control List | **ACL** | Always all caps. Spell out on first use: "Access Control List (ACL)" |
| Zero-Knowledge Proof of Knowledge | **ZKPoK** | Capital Z, K, P, K |
| EIP-712 | **EIP-712** | With hyphen, not EIP712 |

### Infrastructure terms

| Term | Correct | Notes |
| --- | --- | --- |
| Gateway | **Gateway** or **Gateway Chain** | Capital G when referring to the Zama Gateway infrastructure |
| Relayer | **Relayer** | Capital R when referring to the Zama Relayer service |
| Coprocessor | **coprocessor** | Lowercase in prose |

### Contract names (in code context, always backtick)

| Contract | Usage |
| --- | --- |
| `ACL` | Access control contract |
| `FHEVMExecutor` | Executor contract (note: not TFHEExecutor) |
| `KMSVerifier` | KMS signature verification contract |
| `InputVerifier` | Input proof verification contract |
| `GatewayContract` | Gateway routing contract |
| `ZamaConfig` | Chain configuration contract |

### FHE types

In **Solidity** context (contract code), types use lowercase:
`ebool`, `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `euint256`, `eaddress`, `ebytes64`, `ebytes128`, `ebytes256`

In **table headers and prose** (outside code), Zama capitalizes the first letter:
Ebool, Euint8, Euint16, Euint32, Euint64, Euint128, Euint256, Eaddress

External handle types: `externalEbool`, `externalEuint8`, `externalEaddress`, etc.

### FHE library calls

The Solidity library is called `FHE` (not `TFHE`). Functions use dot notation:
`FHE.add`, `FHE.sub`, `FHE.mul`, `FHE.asEuint8`, `FHE.asEbool`, `FHE.asEaddress`, `FHE.allow`, `FHE.allowThis`, `FHE.select`, `FHE.fromExternal`, `FHE.isSenderAllowed`, `FHE.setCoprocessor`

### SDK-specific terms

| Term | Correct | Notes |
| --- | --- | --- |
| `FhevmInstance` | PascalCase | The SDK instance type |
| `FhevmChain` | PascalCase | Chain configuration type |
| `E2eTransportKeyPair` | PascalCase | E2E transport key pair for decryption |
| `SignedPermit` | PascalCase | Signed decrypt permit |
| `GlobalFhePkeParams` | PascalCase | Public key encryption parameters |
| `TrustedClient` | PascalCase | Opaque sealed client |

### Terminology for operations

Use these terms consistently throughout all documentation:

| Operation | Correct term in prose | Never use |
| --- | --- | --- |
| Private decryption | **decrypt**, **decryption** | "user decryption", "user decrypt" |
| Public value reading | **read public value**, **reading a public value** | "public decryption", "public decrypt" |
| Delegated decryption | **decrypt on behalf of**, **decrypting on behalf of** | "delegated decryption", "delegated decrypt" |
| Encrypted data references | **encrypted value**, **encrypted input** | "handle" (avoid in prose; OK in code/API context) |

**Why:** "User decryption" and "public decryption" are internal SDK terms. In docs, use the developer-facing language that matches the API: `decrypt()`, `readPublicValue()`, `onBehalfOf`.

**Handles:** The word "handle" is an internal implementation detail. In developer-facing prose, prefer "encrypted value" or "encrypted input". It's fine to use "handle" when explaining code that returns or accepts handle objects, or in API reference pages — just don't use it as the primary way to describe encrypted data.

### Describing the Zama Protocol internals

When explaining what happens behind the scenes, refer to **the Zama Protocol** rather than specific infrastructure components. Avoid naming internal services like Gateway, KMS, Relayer, or coprocessor unless the developer needs to interact with them directly.

| Instead of | Write |
| --- | --- |
| "The KMS decrypts your data" | "The Zama Protocol decrypts your data" |
| "The Relayer forwards the request to the KMS" | "The SDK sends the request to the Zama Protocol" |
| "The Gateway routes the request" | "The Zama Protocol processes the request" |

**Exception:** When the developer needs to configure or understand a specific component (e.g., `relayerUrl` in chain config, or KMS signatures in `PublicDecryptionProof`), name it. The rule is: don't introduce internal terms unless the developer will see them in code.

## Developer experience mindset

You are writing for **end developers** who want to build apps on FHEVM. Everything you write should serve their needs. Before writing any section, ask yourself: "If I were a developer seeing this SDK for the first time, what would I need to know?"

### Principles

1. **Think from the developer's perspective.** They don't care about internal architecture unless it affects how they use the SDK. Lead with what they can do, not how it works internally. Show the happy path first, edge cases second.

2. **Use simple language.** FHE is already complex enough — the docs should not add complexity. Prefer everyday words over jargon. When a technical term is unavoidable, explain it on first use. Write at a level where a developer who knows Ethereum but not FHE can follow along.

3. **Be thorough.** Document everything. Every parameter, every return type, every constraint. A developer should never have to read source code to understand how to use an API. When in doubt, include more detail rather than less. Verbose explanations are better than gaps that force developers to guess.

4. **Explain the why, not just the what.** Don't just say "pass `extraData`" — explain what it's for and what happens if you get it wrong. Don't just say "use `createFhevmEncryptClient`" — explain why you'd choose it over `createFhevmClient` (smaller WASM footprint, faster load).

5. **Make every code example copy-pasteable.** A developer should be able to copy an example into their project and have it work (or nearly work, needing only their own addresses/keys). Include imports. Use realistic values. Don't use `...` or `/* your code here */` — show the actual code.

6. **Simplify relentlessly.** If a concept can be explained with a 3-line code example, use that instead of 3 paragraphs of prose. If a table communicates information more clearly than a paragraph, use a table. If a flow has 5 steps, number them — don't bury them in prose.

7. **Anticipate questions.** After explaining a concept, ask yourself: "What would a developer ask next?" and answer it. Common questions: "What happens if...?", "When would I use this vs that?", "What are the limits?", "Can I reuse this?"

8. **Progressive disclosure.** Start simple, add complexity. The getting started page should get someone to a working encrypt/decrypt in under 5 minutes. Deep dives on architecture, security patterns, and edge cases go in dedicated pages.

## Voice and tone

- **Second person**: "you", "your contract", "you can"
- **Active voice**: "This function validates..." not "The input is validated by..."
- **Direct and practical**: get to the point, no filler
- **No hedging**: "This function returns X" not "This function should return X"
- **Explain why alongside how**: "This ensures that encrypted data remains secure while still being usable"
- **Friendly but not casual**: professional tone, but not stiff. You're a knowledgeable colleague explaining things clearly, not a professor lecturing.
- **Empathetic**: acknowledge when something is complex or surprising. "This may seem like an extra step, but it gives you control over when the ~50MB key download happens."

## Formatting

- **Bold** for key terms on first introduction: **Fully Homomorphic Encryption (FHE)**
- **Inline code** for all technical identifiers: `FHE.add`, `euint64`, `msg.sender`, `encrypt()`
- **Code blocks** always have a language annotation: `ts`, `solidity`, `bash`
- **Code blocks** are always preceded by explanatory prose — never bare
- **Tables** use standard markdown with pipe separators
- **Lists** use `-` for unordered, `1.` for ordered
- **Links** use descriptive text: `[Encryption guide](encryption.md)` not `[click here](encryption.md)`

## Emoji usage

- `🟨` — navigation links in "Where to go next" sections
- `❌` / `✅` — bad practice vs. good practice code comparisons
- No other emojis in body text unless specifically requested

## Code examples

- Always include imports
- Show complete working examples, not fragments
- Solidity blocks include full function context
- TypeScript blocks show realistic usage with real types
- Shell commands use `bash` language annotation
- Precede every code block with a sentence explaining what it does
