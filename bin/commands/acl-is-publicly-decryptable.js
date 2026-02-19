'use strict';

import { logCLI, parseCommonOptions } from '../utils.js';
import { ACL } from '../../lib/internal.js';

// npx . acl is-publicly-decryptable --handle 0xe85c2a81338b8542a6c0a99a5a794f158f4fb0f6a2ff0000000000aa36a70400
export async function aclIsPubliclyDecryptable(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

  const aclContractAddress = config.fhevmInstanceConfig.aclContractAddress;

  const acl = new ACL({ aclContractAddress, provider });

  const ok = await acl.isAllowedForDecryption([options.handle]);

  console.log(ok[0]);
}
