declare const __trustedValue: unique symbol;
/**
 * An opaque, tamper-proof container for a value of type `T`.
 *
 * ## Authenticity model
 *
 * A `TrustedValue` guarantees that:
 * 1. **Origin authenticity** — only code that holds the original `symbol` token
 *    can verify the value, proving it was created by a trusted origin.
 * 2. **Tamper resistance** — the inner value cannot be read, modified, or
 *    replaced by external code (enforced by `#private` fields and
 *    `Object.freeze`).
 * 3. **Forgery resistance** — external code cannot construct a valid instance
 *    (the implementation class is not exported).
 *
 * ## Typical flow
 *
 * 1. A library creates a trusted value with a private token:
 *    `const trusted = createTrustedValue(secret, myToken)`
 * 2. The trusted value is passed to external code, which can hold and forward
 *    it but cannot inspect or alter its contents.
 * 3. When the trusted value is returned, the library verifies authenticity and
 *    extracts the inner value: `const secret = verifyTrustedValue(trusted, myToken)`
 *
 * @typeParam T - The type of the inner value. Defaults to `unknown`.
 */
export type TrustedValue<T = unknown> = {
    readonly [__trustedValue]: T;
};
/**
 * Creates a new {@link TrustedValue} bound to the given token.
 *
 * Only the holder of `token` can later extract the inner value
 * via {@link verifyTrustedValue}.
 *
 * @param value - The value to wrap.
 * @param token - A `symbol` that acts as the authenticity key.
 * @returns A frozen, opaque {@link TrustedValue} instance.
 */
export declare function createTrustedValue<T>(value: T, token: symbol): TrustedValue<T>;
/**
 * Verifies authenticity and extracts the inner value from a {@link TrustedValue}.
 *
 * @param trustedValue - The trusted value to verify.
 * @param token - The same `symbol` used at creation time.
 * @returns The original inner value of type `T`.
 * @throws {Error} `"Invalid TrustedValue"` if the argument is not a genuine
 *   {@link TrustedValue} instance.
 * @throws {Error} `"Token mismatch"` if the token does not match the one
 *   used at creation time.
 */
export declare function verifyTrustedValue<T>(trustedValue: TrustedValue<T>, token: symbol): T;
export {};
//# sourceMappingURL=trustedValue.d.ts.map