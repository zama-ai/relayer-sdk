import { parseCommonOptions } from '../utils.js';
import { loadFhevmPublicKeyConfig } from '../pubkeyCache.js';

// npx . pubkey fetch
export async function pubkeyFetchCommand(options) {
  const { config } = parseCommonOptions(options);

  await loadFhevmPublicKeyConfig(config, options);
}
