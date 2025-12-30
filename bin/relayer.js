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
  .requiredOption('--handle <handle>', 'The handle to decrypt')
  .action(async (options) => {
    if (!options.contractAddress) {
      console.error('Error: --contract-address is required for user-decrypt');
      process.exit(1);
    }
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

// npx . pubkey info --network testnet
pubkey
  .command('info')
  .option('--network <network name>', 'testnet|devnet|mainnet')
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
  .option('--network <network name>', 'testnet|devnet|mainnet')
  .action(async (options) => {
    const mod = await import('./commands/pubkey-clear.js');
    await mod.pubkeyClearCommand(options);
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

////////////////////////////////////////////////////////////////////////////////
// ACL
////////////////////////////////////////////////////////////////////////////////

const acl = program.command('acl').description('ACL operations');

// npx . acl address
addCommonOptions(acl.command('address'))
  .description('Display ACL contract address')
  .action(async (options) => {
    const mod = await import('./commands/acl-address.js');
    await mod.testACLAddressCommand(options);
  });

// npx . acl is-publicly-decryptable --handle 0x...
addCommonOptions(acl.command('is-publicly-decryptable'))
  .description('Display ACL contract address')
  .requiredOption('--handle <handle>', 'The handle as bytes 32 hex')
  .action(async (options) => {
    const mod = await import('./commands/acl-is-publicly-decryptable.js');
    await mod.testFHETestIsPubliclyDecryptableCommand(options);
  });

////////////////////////////////////////////////////////////////////////////////
// test FHETest.sol
////////////////////////////////////////////////////////////////////////////////

const test = program.command('test').description('Test operations');

// npx . test address
addCommonOptions(test.command('address'))
  .description('Display FHETest contract address')
  .action(async (options) => {
    const mod = await import('./commands/test/test-address.js');
    await mod.testFHETestAddressCommand(options);
  });

// npx . test get --type euint32
addCommonOptions(test.command('get'))
  .description('Call view function: FHETest.get<Type>')
  .requiredOption(
    '--type <ebool|euint8|euint16|euint32|euint64|euint128|euint256|eaddress>',
    'The encrypted type',
  )
  .action(async (options) => {
    const mod = await import('./commands/test/test-get.js');
    await mod.testFHETestGetCommand(options);
  });

// npx . test make-publicly-decryptable --type euint32
addCommonOptions(test.command('make-publicly-decryptable'))
  .description(
    'Execute the transaction: FHETest.makePubliclyDecryptable<Type>()',
  )
  .requiredOption(
    '--type <ebool|euint8|euint16|euint32|euint64|euint128|euint256|eaddress>',
    'The encrypted type',
  )
  .action(async (options) => {
    const mod = await import(
      './commands/test/test-make-publicly-decryptable.js'
    );
    await mod.testFHETestMakePubliclyDecryptableCommand(options);
  });

// npx . test random --type euint32
addCommonOptions(test.command('random'))
  .description('Execute the transaction: FHETest.rand<Type>()')
  .requiredOption(
    '--type <ebool|euint8|euint16|euint32|euint64|euint128|euint256|eaddress>',
    'The encrypted type',
  )
  .action(async (options) => {
    const mod = await import('./commands/test/test-random.js');
    await mod.testFHETestRandomCommand(options);
  });

// npx . test public-decrypt --type euint32 --network testnet
addCommonOptions(test.command('public-decrypt'))
  .description(
    'Performs a public decryption of the handle returned by FHETest.get<Type>()',
  )
  .requiredOption(
    '--type <ebool|euint8|euint16|euint32|euint64|euint128|euint256|eaddress>',
    'The encrypted type',
  )
  .action(async (options) => {
    const mod = await import('./commands/test/test-public-decrypt.js');
    await mod.testFHETestPublicDecryptCommand(options);
  });

// npx . test user-decrypt --type euint32 --network testnet
addCommonOptions(test.command('user-decrypt'))
  .description(
    'Performs a user decryption of the handle returned by FHETest.get<Type>()',
  )
  .requiredOption(
    '--type <ebool|euint8|euint16|euint32|euint64|euint128|euint256|eaddress>',
    'The encrypted type',
  )
  .action(async (options) => {
    const mod = await import('./commands/test/test-user-decrypt.js');
    await mod.testFHETestUserDecryptCommand(options);
  });

// npx . test add --type euint32 --value 123 --network testnet
addCommonOptions(test.command('add'))
  .description(
    'Performs an input-proof then executes a transaction to call FHETest.add<Type>()',
  )
  .requiredOption(
    '--type <euint8|euint16|euint32|euint64|euint128>',
    'The encrypted type',
  )
  .requiredOption('--value <unsigned integer value>', 'The uint value to add')
  .action(async (options) => {
    const mod = await import('./commands/test/test-add.js');
    await mod.testFHETestAddCommand(options);
  });

program.parseAsync();
