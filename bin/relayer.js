#!/usr/bin/env node
'use strict';

import { program } from 'commander';
import { addCommonOptions } from './utils.js';
import { inputProofCommand } from './commands/input-proof.js';
import { configCommand } from './commands/config.js';
import { publicDecryptCommand } from './commands/public-decrypt.js';

////////////////////////////////////////////////////////////////////////////////
// input-proof
////////////////////////////////////////////////////////////////////////////////

// npx . input-proof --values true:ebool
// npx . input-proof --contract-address 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9 --user-address 0x37AC010c1c566696326813b840319B58Bb5840E4 --values true:ebool
// TODO: be able to pass a full configuration, or simply the chain-id/name, or relayer-url
addCommonOptions(program.command('input-proof'))
  .requiredOption('--values <value:type-name...>', 'List of values')
  .action(async (options) => {
    await inputProofCommand(options);
  });

////////////////////////////////////////////////////////////////////////////////
// public-decrypt
////////////////////////////////////////////////////////////////////////////////

addCommonOptions(program.command('public-decrypt'))
  .requiredOption('--handles <handles...>', 'List of handles to decrypt')
  .action(async (options) => {
    await publicDecryptCommand(options);
  });

////////////////////////////////////////////////////////////////////////////////
// user-decrypt
////////////////////////////////////////////////////////////////////////////////

addCommonOptions(program.command('user-decrypt'))
  .requiredOption('--handles <handles...>', 'List of handles to decrypt')
  .action(async (options) => {
    const mod = await import('./commands/user-decrypt.js');
    await mod.userDecryptCommand(options);
  });

////////////////////////////////////////////////////////////////////////////////
// handle
////////////////////////////////////////////////////////////////////////////////

addCommonOptions(program.command('handle'))
  .argument('<handles...>', 'List of handles to parse')
  .action(async (handles, options) => {
    const mod = await import('./commands/handle.js');
    await mod.handleCommand(handles, options);
  });

////////////////////////////////////////////////////////////////////////////////
// config
////////////////////////////////////////////////////////////////////////////////

// npx . config --contract-address 0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9 --user-address 0x37AC010c1c566696326813b840319B58Bb5840E4
addCommonOptions(program.command('config')).action(async (options) => {
  await configCommand(options);
});

////////////////////////////////////////////////////////////////////////////////

// Create 'pubkey' command group
const pubkey = program.command('pubkey').description('Public key operations');

////////////////////////////////////////////////////////////////////////////////
// pubkey info
////////////////////////////////////////////////////////////////////////////////

// npx . pubkey info
pubkey
  .command('info')
  .description('Display public key information')
  .action(async (options) => {
    const mod = await import('./commands/pubkey-info.js');
    await mod.pubkeyInfoCommand(options);
  });

////////////////////////////////////////////////////////////////////////////////
// pubkey fetch
////////////////////////////////////////////////////////////////////////////////

// npx . pubkey fetch
addCommonOptions(pubkey.command('fetch'))
  .description('Fetch FHEVM public key')
  .action(async (options) => {
    const mod = await import('./commands/pubkey-fetch.js');
    await mod.pubkeyFetchCommand(options);
  });

////////////////////////////////////////////////////////////////////////////////
// pubkey delete
////////////////////////////////////////////////////////////////////////////////

// npx . pubkey delete
pubkey
  .command('delete')
  .description('Clear FHEVM public key cache')
  .action(async () => {
    const mod = await import('./commands/pubkey-clear.js');
    await mod.pubkeyClearCommand();
  });

////////////////////////////////////////////////////////////////////////////////
// test fhecounter-get-count
////////////////////////////////////////////////////////////////////////////////

const test = program.command('test').description('Test operations');

// npx . test fhecounter-get-count
addCommonOptions(test.command('fhecounter-get-count'))
  .description('Call FHECounter.getCount()')
  .action(async (options) => {
    const mod = await import('./commands/test-fhecounter-getcount.js');
    await mod.testFheCounterGetCountCommand(options);
  });

////////////////////////////////////////////////////////////////////////////////

// Create 'zkproof' command group
const zkproof = program.command('zkproof').description('ZKProof operations');

addCommonOptions(zkproof.command('generate'))
  .description('Generate ZKProof')
  .requiredOption('--values <value:type-name...>', 'List of values')
  .action(async (options) => {
    const mod = await import('./commands/zkproof-generate.js');
    await mod.zkProofGenerateCommand(options);
  });

// addCommonOptions(zkproof.command('verify'))
//   .description('Verify ZKProof')
//   .action(async (options) => {
//     const mod = await import('./commands/zkproof-verify.js');
//     await mod.zkProofVerifyCommand(options);
//   });

program.parseAsync();
