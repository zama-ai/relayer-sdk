/**
 * Fetch bytes from a URL and return as Uint8Array.
 */
export async function fetchBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} on ${response.url}`,
    );
  }

  // Warning : bytes is not widely supported yet!
  const bytes: Uint8Array =
    typeof response.bytes === 'function'
      ? await response.bytes()
      : new Uint8Array(await response.arrayBuffer());

  return bytes;
}

/*
  Nodejs Fetch:
  =============
  https://github.com/nodejs/undici/blob/8fd6c43c65952ebd2557964a726716879dea5506/lib/web/fetch/index.js#L135

  TypeError:
    -  webidl.argumentLengthCheck(arguments, 1, 'globalThis.fetch')
  
  Error:
    - new Request(input, init)  
      TypeError: 
        - throw new TypeError('Failed to parse URL from ' + input, { cause: err })
        - throw new TypeError(
          'Request cannot be constructed from a URL that includes credentials: ' +
            input
        )
        - throw new TypeError(`'window' option '${window}' must be null`)
        - throw new TypeError(`Referrer "${referrer}" is not a valid URL.`, { cause: err })
        - ...

  AbortError:
    - Abort signal

  TypeError (Nodejs undici):

    // See https://github.com/nodejs/undici/blob/8fd6c43c65952ebd2557964a726716879dea5506/lib/web/fetch/index.js#L237
    if (response.type === 'error') {
      p.reject(new TypeError('fetch failed', { cause: response.error }))
      return
    }

    "fetch failed" - general network failure
      - ECONNREFUSED (net.connect() / tls.connect())
      - ENOTFOUND (net.connect() / tls.connect())
      - UND_ERR_xxx (undici errors)

    Undici error is accessible via: `TypeError.cause`
*/

interface FetchErrorInfo {
  name: string;
  message: string;
  props: Record<string, string | number>;
}

/**
 * Extracts structured error information from a fetch error's cause chain.
 *
 * Node.js fetch (undici) wraps network errors in a TypeError with a `cause`
 * property pointing to the underlying error. This function traverses the
 * cause chain and extracts:
 * - `name`: The error name (e.g., "TypeError", "Error")
 * - `message`: The error message
 * - `props`: All string/number properties (e.g., code, errno, syscall, hostname)
 *
 * Uses duck typing (checks for `message` property) rather than `instanceof`
 * to handle cross-realm errors.
 *
 * @example
 * // For a DNS lookup failure:
 * // TypeError: fetch failed
 * //   cause: Error: getaddrinfo ENOTFOUND example.com
 * //          { code: 'ENOTFOUND', errno: -3008, syscall: 'getaddrinfo', hostname: 'example.com' }
 * //
 * // Returns:
 * // [
 * //   {
 * //     name: 'TypeError',
 * //     message: 'fetch failed',
 * //     props: {}
 * //   },
 * //   {
 * //     name: 'Error',
 * //     message: 'getaddrinfo ENOTFOUND example.com',
 * //     props: {
 * //       code: 'ENOTFOUND',
 * //       errno: -3008,
 * //       syscall: 'getaddrinfo',
 * //       hostname: 'example.com'
 * //     }
 * //   }
 * // ]
 */
function getFetchErrorInfo(error: unknown): FetchErrorInfo[] {
  const errors: FetchErrorInfo[] = [];
  let current: unknown = error;

  const skipProps = new Set(['message', 'cause', 'stack', 'name']);

  while (current !== null && typeof current === 'object') {
    const obj = current as Record<string, unknown>;

    if (typeof obj.message !== 'string') {
      break;
    }

    const name = typeof obj.name === 'string' ? obj.name : 'Error';
    const props: Record<string, string | number> = {};

    for (const key of Object.keys(obj)) {
      if (skipProps.has(key)) continue;

      const value = obj[key];
      if (typeof value === 'string' || typeof value === 'number') {
        props[key] = value;
      }
    }

    errors.push({ name, message: obj.message, props });
    current = obj.cause;
  }

  return errors;
}

/**
 * Formats a fetch error into an array of human-readable messages.
 *
 * Traverses the error's cause chain and formats each error with its message
 * and properties. The root error uses standard "Name: message" format, while
 * nested causes are prefixed with "Cause: " and include name in the props.
 *
 * @param error - The error to format (typically from a failed fetch call)
 * @returns An array of formatted error messages, one per error in the cause chain
 *
 * @example
 * // For a DNS lookup failure (ENOTFOUND):
 * // Input error structure:
 * //   TypeError: fetch failed
 * //     cause: Error: getaddrinfo ENOTFOUND api.example.com
 * //            { code: 'ENOTFOUND', errno: -3008, syscall: 'getaddrinfo', hostname: 'api.example.com' }
 * //
 * // Output:
 * // [
 * //   "TypeError: fetch failed",
 * //   "Cause: getaddrinfo ENOTFOUND api.example.com [name=Error, code=ENOTFOUND, errno=-3008, syscall=getaddrinfo, hostname=api.example.com]"
 * // ]
 *
 * @example
 * // For a connection refused error (ECONNREFUSED):
 * // Output:
 * // [
 * //   "TypeError: fetch failed",
 * //   "Cause: connect ECONNREFUSED 127.0.0.1:3000 [name=Error, code=ECONNREFUSED, errno=-61, syscall=connect, address=127.0.0.1, port=3000]"
 * // ]
 */
export function formatFetchErrorMetaMessages(error: unknown): string[] {
  const infos = getFetchErrorInfo(error);
  if (infos.length === 0) {
    return [String(error)];
  }

  return infos.map((info, index) => {
    const isRoot = index === 0;
    const propEntries = Object.entries(info.props);

    if (isRoot) {
      // Root error: "TypeError: fetch failed [props...]" or "TypeError: fetch failed"
      const propsStr =
        propEntries.length > 0
          ? ` [${propEntries.map(([k, v]) => `${k}=${v}`).join(', ')}]`
          : '';
      return `${info.name}: ${info.message}${propsStr}`;
    } else {
      // Cause errors: "Cause: message [name=Error, props...]"
      const allProps: Array<[string, string | number]> = [
        ['name', info.name],
        ...propEntries,
      ];
      const propsStr = ` [${allProps.map(([k, v]) => `${k}=${v}`).join(', ')}]`;
      return `Cause: ${info.message}${propsStr}`;
    }
  });
}
