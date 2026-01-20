'use strict';

import { parseCommonOptions } from '../utils.js';
import { ACL } from '../../lib/internal.js';

// npx . acl is-allowed --handle 0xf6751d547a5c06123575aad93f22f76b7d841c4cacff0000000000aa36a70000 --address 0x37AC010c1c566696326813b840319B58Bb5840E4
export async function aclIsAllowedCommand(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

  const aclContractAddress = config.fhevmInstanceConfig.aclContractAddress;

  const acl = new ACL({ aclContractAddress, provider });

  const ok = await acl.persistAllowed([options.handle, options.address]);

  console.log(ok[0]);
}
