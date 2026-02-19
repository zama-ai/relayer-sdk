# Authenticity

- When same-realm-authenticity is needed
- This pattern is not for cross-realms

- Files:
- AuthenticProducer.ts
- OptionalAuthenticData.ts

```typescript
// OptionalAuthenticData.ts
// Pattern for a class that may or may not need authenticity verification
export class OptionalAuthenticData {
  #authenticData: number;
  readonly #brand?: symbol | undefined;

  protected constructor(
    params: {
      data: number;
    },
    brand?: symbol,
  ) {
    if (brand !== undefined) {
      if (typeof brand !== 'symbol') {
        throw new Error('Internal error');
      }
    }
    if (typeof params.data !== 'number') {
      throw new Error('Internal error');
    }
    this.#authenticData = params.data;
    this.#brand = brand;
  }

  public static isValid(
    value: unknown,
    brand: symbol,
  ): value is OptionalAuthenticData {
    return (
      typeof value === 'object' &&
      value !== null &&
      #brand in value &&
      value.#brand === brand
    );
  }

  // The caller knows its own private/secret brand
  public static fromComponents(
    params: { data: number },
    brand?: symbol,
  ): OptionalAuthenticData {
    return new OptionalAuthenticData(params, brand);
  }
}
```

```typescript
// AuthenticProducer.ts
import { OptionalAuthenticData } from './OptionalAuthenticData.ts';

const BRAND = Symbol('AuthenticProducer.brand');

export class AuthenticProducer {
  readonly #brand: symbol = BRAND;

  public getAuthenticData(): OptionalAuthenticData[] {
    return [OptionalAuthenticData.fromComponents({ data: 123 }, this.#brand)];
  }

  public doSomething(authenticData: OptionalAuthenticData) {
    if (!OptionalAuthenticData.isValid(authenticData, this.#brand)) {
      throw new Error('This is not my data');
    }
  }
}
```
