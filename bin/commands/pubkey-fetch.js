import { parseCommonOptions } from '../utils.js';
import { loadFhevmPubKey } from '../pubkeyCache.js';

// npx . pubkey fetch
export async function pubkeyFetchCommand(options) {
  const { config } = parseCommonOptions(options);

  await loadFhevmPubKey(config, options);
}
