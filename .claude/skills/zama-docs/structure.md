# Page structure

## Where these docs live

These docs are the **Relayer SDK Guides** section within the larger Zama documentation at docs.zama.org. The full docs site has these top-level sections:

| Section | What it covers |
| --- | --- |
| Overview | Introduction to the Zama Protocol |
| Zama Protocol Litepaper | The protocol whitepaper |
| Protocol Apps | Protocol-level applications |
| **Solidity Guides** | Writing confidential smart contracts (Solidity side) |
| **Relayer SDK Guides** ← this is us | Client-side SDK for encryption, decryption, key management |
| Code Examples | Example dApps and integrations |
| MiCA | Regulatory compliance |

When cross-referencing, link to Solidity Guides for contract-side topics (e.g., `FHE.allow()`, ACL, encrypted types) and keep SDK docs focused on the `@fhevm/sdk` JavaScript/TypeScript API.

## Section README pattern

Every section in the Zama docs starts with a **README.md** that serves as the landing page. This is the first thing a developer sees when they navigate to the section. Follow this exact structure:

```markdown
# Overview

**Welcome to [Section Name]!**

One-paragraph description of what this section covers and what the developer will learn.

## Where to go next

If you're new to the Zama Protocol, start with the [Litepaper](https://docs.zama.ai/protocol/zama-protocol-litepaper) or the [Protocol Overview](https://docs.zama.ai/protocol) to understand the foundations.

Otherwise:

🟨 Go to [**Page title**](page.md) to learn about X.

🟨 Go to [**Page title**](page.md) to do Y.

🟨 Go to [**Page title**](page.md) for Z.

## Help center

Ask technical questions and discuss with the community.

- [Community forum](https://community.zama.ai/c/zama-protocol/15)
- [Discord channel](https://discord.com/invite/zama)
```

Key rules:
- The H1 title is always `# Overview`
- The welcome line is always bold: `**Welcome to [Section Name]!**`
- The "Where to go next" section always starts with the Litepaper/Protocol Overview cross-reference for newcomers
- Navigation links use 🟨 emoji bullets with bold link text
- Every section README ends with a "Help center" section linking to the community forum and Discord

## Navigation (SUMMARY.md)

The sidebar is defined in `SUMMARY.md` using nested markdown lists:

```markdown
# Table of contents

- [Overview](README.md)

## Getting started

- [Quick start](getting-started.md)
- [Quick start tutorial](quick-start-tutorial.md)

## Guides

- [Encryption](encryption.md)
- [Decryption](decryption.md)
```

Group headings use `## Section name` (sentence case). Pages use `- [Title](path.md)`. Nesting creates sub-pages in the sidebar.

## Heading hierarchy

- **H1 (`#`)** — one per page, the page title
- **H2 (`##`)** — major sections
- **H3 (`###`)** — subsections
- **H4 (`####`)** — sub-steps within steppers, or "Replace" / "With" markers

All headings use sentence case. Only the first word and proper nouns are capitalized:

```markdown
## Where to go next
### Create a client
### Supported types
```

## Page types

### Section landing page (README.md)

See "Section README pattern" above. Every section or sub-section that introduces a new concept area starts with a README.md following that pattern.

### Technical/reference pages

1. H1 title (descriptive noun phrase)
2. Opening paragraph — what it is, why it matters, who needs to read this
3. Concept explanation or type definition
4. Code examples with prose
5. "Best practices" section (when applicable)

### Tutorial pages

1. H1 title (action-oriented)
2. "What you'll learn" section
3. Prerequisites
4. Step-by-step instructions (use `{% stepper %}` blocks for GitBook, numbered headings for plain markdown)
5. Congratulatory closing

## Cross-references

- Internal links (within SDK docs): relative paths `[Clients](clients.md)`
- Bold for navigation links: `[**Quick start**](getting-started.md)`
- Solidity Guides cross-references: full URL `[ACL Guide](https://docs.zama.ai/protocol/solidity-guides/smart-contract/acl)`
- Protocol/Litepaper cross-references: full URL `[Litepaper](https://docs.zama.ai/protocol/zama-protocol-litepaper)`
- "For more information see [Topic](link)" at end of sections

## File naming

- `README.md` for section landing pages (mandatory for every section)
- `SUMMARY.md` for sidebar navigation
- Kebab-case for content files: `getting-started.md`, `api-reference.md`
