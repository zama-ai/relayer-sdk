'use strict';

import { parseCommonOptions } from '../utils.js';

// npx . config
// npx . config --name testnet
// npx . config --name devnet
// npx . config --contract-address 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9 --user-address 0x37AC010c1c566696326813b840319B58Bb5840E4
export async function configCommand(options) {
  const { config } = parseCommonOptions(options);

  console.log(JSON.stringify(config, null, 2));
}
