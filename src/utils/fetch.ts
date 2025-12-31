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
