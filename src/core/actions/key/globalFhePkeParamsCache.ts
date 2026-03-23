import type {
  SerializeGlobalFhePkeParamsParameters,
  SerializeGlobalFhePkeParamsReturnType,
} from "../encrypt/serializeGlobalFhePkeParams.js";
import type {
  GlobalFhePkeParams,
  GlobalFhePkeParamsBytes,
} from "../../types/globalFhePkeParams.js";

////////////////////////////////////////////////////////////////////////////////

type CacheMetadata = {
  readonly chainId: number;
  readonly relayerUrl: string;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * A live mutable cache entry (placeholder).
 *
 * Callers hold a reference and observe state changes across awaits.
 * - `resolvedKind`: kind of the currently available value ("bytes" | "wasm"),
 *   or `undefined` if no value has resolved yet.
 * - `value`: the resolved data, or `undefined` while no value is available.
 * - `pendingKind`: kind of the value being fetched/converted ("bytes" | "wasm"),
 *   or `undefined` if idle.
 * - `pendingOp`: type of in-flight operation ("fetching" | "converting"),
 *   or `undefined` if idle.
 * - `ready`: the promise to await. When it resolves, `value` is populated,
 *   `resolvedKind` is updated, and `pendingKind`/`pendingOp` are `undefined`.
 */
export interface CacheEntry {
  readonly resolvedKind: "bytes" | "wasm" | undefined;
  readonly value: GlobalFhePkeParamsBytes | GlobalFhePkeParams | undefined;
  readonly pendingKind: "bytes" | "wasm" | undefined;
  readonly pendingOp: "fetching" | "converting" | undefined;
  readonly metadata: CacheMetadata;
  readonly ready: Promise<void>;
}

class CacheEntryImpl implements CacheEntry {
  resolvedKind: "bytes" | "wasm" | undefined;
  value: GlobalFhePkeParamsBytes | GlobalFhePkeParams | undefined;
  pendingKind: "bytes" | "wasm" | undefined;
  pendingOp: "fetching" | "converting" | undefined;
  metadata: CacheMetadata;
  ready!: Promise<void>;

  /** @internal promise on the future value being resolved. Do not use externally. */
  _pending!: Promise<GlobalFhePkeParamsBytes | GlobalFhePkeParams>;
  /** @internal debug: true if `_pending` has been chained from (e.g. by ensureWasm). */
  _pendingChained: boolean;

  constructor(metadata: CacheMetadata) {
    this.resolvedKind = undefined;
    this.value = undefined;
    this.pendingKind = undefined;
    this.pendingOp = undefined;
    this.metadata = metadata;
    this._pendingChained = false;
  }
}

////////////////////////////////////////////////////////////////////////////////

/** Debug: if resolvedKind is "wasm", there must be no pending operation. */
function assertWasmIsTerminal(entry: CacheEntry): void {
  if (entry.resolvedKind === "wasm" && entry.pendingKind !== undefined) {
    throw new Error(
      "Debug: resolvedKind is 'wasm' but pendingKind is " +
        JSON.stringify(entry.pendingKind),
    );
  }
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Global cache for FHE public key parameters.
 *
 * Keyed by relayer URL. Each entry is a live mutable placeholder that callers
 * hold a reference to and observe state changes across awaits.
 */
export class GlobalFhePkeParamsCache {
  readonly #cache = new Map<string, CacheEntryImpl>();

  ////////////////////////////////////////////////////////////////////////////////

  get(relayerUrl: string): CacheEntry | undefined {
    return this.#cache.get(relayerUrl);
  }

  has(relayerUrl: string): boolean {
    return this.#cache.has(relayerUrl);
  }

  remove(relayerUrl: string): boolean {
    const entry = this.#cache.get(relayerUrl);
    if (entry !== undefined) {
      this.#invalidate(entry);
    }
    return this.#cache.delete(relayerUrl);
  }

  clear(): void {
    for (const entry of this.#cache.values()) {
      this.#invalidate(entry);
    }
    this.#cache.clear();
  }

  /** Stale-ify an entry so in-flight callbacks hit the guard and get swallowed. */
  #invalidate(entry: CacheEntryImpl): void {
    entry.ready = Promise.resolve();
    entry.pendingKind = undefined;
    entry.pendingOp = undefined;
  }

  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Fetch-or-get bytes from the cache.
   *
   * - If any entry already exists (pending or resolved, any kind): return it as-is.
   *   Wasm is better than bytes; bytes is already being fetched.
   * - If no entry: create a new one.
   *
   * The cache owns the promise lifecycle. The fetcher is only called when needed.
   * Caller should use `remove()` first if a fresh fetch is needed.
   */
  ensureBytes(
    relayerUrl: string,
    fetcher: () => Promise<GlobalFhePkeParamsBytes>,
    metadata: CacheMetadata,
  ): void {
    if (this.#cache.has(relayerUrl)) {
      return;
    }

    const entry = new CacheEntryImpl(metadata);
    const pendingValue = fetcher();

    entry.pendingKind = "bytes";
    entry.pendingOp = "fetching";
    entry._pending = pendingValue;
    entry.ready = this.#makeReady(relayerUrl, entry, "bytes", pendingValue);

    this.#cache.set(relayerUrl, entry);
  }

  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Upgrade a bytes entry to wasm in-place by deserializing.
   * If already wasm (pending or resolved), returns the existing entry.
   * Chains from `_pending` so it works whether bytes are resolved or still pending.
   * Idempotent: repeated calls return the same entry.
   */
  ensureWasm(parameters: {
    readonly relayerUrl: string;
    readonly deserializeFn: (
      bytes: GlobalFhePkeParamsBytes,
    ) => Promise<GlobalFhePkeParams>;
  }): void {
    const { relayerUrl, deserializeFn } = parameters;

    const entry = this.#cache.get(relayerUrl);
    if (entry === undefined) {
      return;
    }

    if (entry.resolvedKind === "wasm" || entry.pendingKind === "wasm") {
      return;
    }

    assertWasmIsTerminal(entry);

    if (entry._pendingChained) {
      throw new Error("Debug: _pending was already chained from");
    }
    entry._pendingChained = true;

    const pendingValue = entry._pending.then((bytes) => {
      assertWasmIsTerminal(entry);
      return deserializeFn(bytes as GlobalFhePkeParamsBytes);
    });

    entry.pendingKind = "wasm";
    entry.pendingOp = "converting";
    entry._pending = pendingValue;
    entry.ready = this.#makeReady(relayerUrl, entry, "wasm", pendingValue);
  }

  /**
   * Get bytes from the cache, converting from wasm if necessary.
   *
   * - No entry → `undefined`
   * - Resolved bytes → return immediately
   * - Resolved wasm → serialize to bytes and return
   * - Pending bytes → await, return resolved bytes
   * - Pending wasm → await, serialize to bytes and return
   */
  async resolveBytes(parameters: {
    readonly relayerUrl: string;
    readonly serializeFn?:
      | ((
          parameters: SerializeGlobalFhePkeParamsParameters,
        ) => Promise<SerializeGlobalFhePkeParamsReturnType>)
      | undefined;
  }): Promise<GlobalFhePkeParamsBytes | undefined> {
    const { relayerUrl, serializeFn } = parameters;

    const entry = this.#cache.get(relayerUrl);
    if (entry === undefined) {
      return undefined;
    }

    // Bytes already available — return immediately, don't wait for pending wasm
    if (entry.resolvedKind === "bytes") {
      return entry.value as GlobalFhePkeParamsBytes;
    }

    // Wasm already available — serialize to bytes
    if (entry.resolvedKind === "wasm") {
      if (serializeFn === undefined) {
        throw new Error(
          "Cannot convert wasm to bytes: serialize function not provided",
        );
      }
      return serializeFn(entry.value as GlobalFhePkeParams);
    }

    if (entry.pendingKind === undefined) {
      return undefined;
    }

    await entry.ready;

    // Re-read after potential await — entry is mutable across await boundaries.
    // Cast needed: TS narrows out "bytes" from the early return above,
    // but the entry can become "bytes" during the await.
    const kind = entry.resolvedKind as "bytes" | "wasm" | undefined;

    if (kind === "bytes") {
      return entry.value as GlobalFhePkeParamsBytes;
    }

    if (kind === "wasm") {
      if (serializeFn === undefined) {
        throw new Error(
          "Cannot convert wasm to bytes: serialize function not provided",
        );
      }
      return serializeFn(entry.value as GlobalFhePkeParams);
    }

    return undefined;
  }

  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Create a `ready` promise that updates entry state on resolution,
   * self-evicts on rejection (if still current), and swallows stale errors.
   */
  #makeReady(
    relayerUrl: string,
    entry: CacheEntryImpl,
    resolvedKind: "bytes" | "wasm",
    pendingValue: Promise<GlobalFhePkeParamsBytes | GlobalFhePkeParams>,
  ): Promise<void> {
    // `ready` is referenced inside the callbacks before this assignment completes,
    // but callbacks are closures that capture the variable binding, not the value.
    // Promise callbacks always run as microtasks (asynchronously), so `ready`
    // is guaranteed to be assigned by the time any callback executes.
    const ready: Promise<void> = pendingValue.then(
      (resolved) => {
        if (entry.ready !== ready) {
          return; // stale: a newer operation replaced us
        }
        entry.resolvedKind = resolvedKind;
        entry.value = resolved;
        entry.pendingKind = undefined;
        entry.pendingOp = undefined;
        assertWasmIsTerminal(entry);
      },
      (err: unknown) => {
        if (entry.ready !== ready) {
          return; // stale: swallow the error
        }
        // Clean up pending state
        entry.pendingKind = undefined;
        entry.pendingOp = undefined;
        // Self-evict
        if (this.#cache.get(relayerUrl) === entry) {
          this.#cache.delete(relayerUrl);
        }
        throw err;
      },
    );
    return ready;
  }
}

////////////////////////////////////////////////////////////////////////////////

export const globalFhePkeParamsCache = new GlobalFhePkeParamsCache();
