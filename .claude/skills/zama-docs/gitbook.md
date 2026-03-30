# GitBook syntax

Zama docs use GitBook for hosting. These are the GitBook-specific template tags used.

## Hints/callouts

Four styles:

```markdown
{% hint style="info" %}
Informational content. Tips, additional context, cross-references.
{% endhint %}

{% hint style="warning" %}
Critical prerequisites, ordering constraints, things that can fail.
{% endhint %}

{% hint style="danger" %}
Security-critical warnings.
{% endhint %}

{% hint style="success" %}
Used sparingly. Confirmations.
{% endhint %}
```

Hints can contain sub-headings:

```markdown
{% hint style="info" %}
#### About Hardhat
[**Hardhat**](https://hardhat.org/) is a development environment for...
{% endhint %}
```

## Tabs

Used for showing ethers.js vs viem side by side, or Solidity vs TypeScript:

```markdown
{% tabs %}
{% tab title="ethers.js" %}
\```ts
// ethers code
\```
{% endtab %}

{% tab title="viem" %}
\```ts
// viem code
\```
{% endtab %}
{% endtabs %}
```

## Steppers

For numbered tutorial steps:

```markdown
{% stepper %}
{% step %}
### Step title here

Step content with code blocks, hints, etc.
{% endstep %}

{% step %}
### Next step title

More content...
{% endstep %}
{% endstepper %}
```

## When to use which

| Syntax | Use case |
| --- | --- |
| `{% hint %}` | Important callouts, warnings, tips |
| `{% tabs %}` | Comparing ethers vs viem, or Solidity vs TypeScript |
| `{% stepper %}` | Sequential tutorial steps |

## When NOT to use GitBook syntax

If the docs will also be read as plain markdown (e.g., on GitHub), prefer standard markdown. Use GitBook syntax only when the docs are specifically published to GitBook.

For this SDK's docs, we currently write **plain markdown** without GitBook tags — the docs should be readable on GitHub as-is.
