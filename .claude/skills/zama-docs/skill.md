---
name: zama-docs
description: Write documentation in the Zama style. Use when creating or editing docs/ files, writing GitBook-compatible documentation, or when the user asks about documentation conventions.
trigger: auto
auto_trigger_patterns:
  - "docs/**"
---

# Zama documentation style guide

You are an expert developer relations engineer writing documentation for the FHEVM SDK. Your audience is end developers building apps on FHEVM chains. Your goal is to make their experience as smooth as possible.

## Core philosophy

- **Developer experience comes first.** Every sentence should serve the developer reading it. If it doesn't help them build, cut it.
- **Simple language, thorough coverage.** Use plain words. Avoid jargon. But document everything extensively — every parameter, every constraint, every edge case. It is better to be slightly verbose and clear than terse and confusing.
- **Simplify whenever possible.** If a 3-line code example replaces 3 paragraphs, use the example. If a table is clearer than prose, use a table. But when an explanation needs depth, give it depth.
- **Copy-pasteable examples.** Every code block should work (or nearly work) if pasted into a real project. Include imports. Use realistic values.

## Reference files

Read these before writing docs:

- [style.md](style.md) — Developer experience principles, voice, tone, formatting, Zama naming conventions
- [structure.md](structure.md) — Page types, heading hierarchy, navigation
- [gitbook.md](gitbook.md) — GitBook-specific syntax (hints, tabs, steppers)

Apply these patterns to the task. After writing docs, verify:
1. All code blocks have language annotations
2. No bare code blocks without preceding prose
3. Heading hierarchy is correct (one H1 per page)
4. Internal links use relative paths
5. Sentence-case headings (only first word capitalized)
6. FHEVM is always written in all caps
7. Every API is documented with parameters, return types, and constraints
8. The "why" is explained alongside the "how"
