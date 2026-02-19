'use strict';

import { logCLI, parseCommonOptions } from '../utils.js';

// npx . acl address
export async function testACLAddressCommand(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

  if (!config.fhevmInstanceConfig.aclContractAddress) {
    logCLI(
      `❌ Unable to determine ACL address on network ${config.name}`,
      options,
    );
  } else {
    logCLI(
      '✅ ACL address: ' + config.fhevmInstanceConfig.aclContractAddress,
      options,
    );
  }
}
