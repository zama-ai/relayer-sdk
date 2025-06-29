#!/usr/bin/env node
'use strict';

import { program } from 'commander';
import { toHexString, prependHttps, throwError } from './utils.js';
import { createInstance, SepoliaConfig } from '../lib/node.cjs';

const allowedBits = [1, 4, 8, 16, 32, 64];

let _instance;

const getInstance = async (networkUrl) => {
  if (_instance) return _instance;

  try {
    // NOTE: hack to get the instance created
    const config = { ...SepoliaConfig, network: networkUrl };
    console.debug(`Using network ${config.network}`);
    _instance = await createInstance(config);
  } catch (e) {
    return throwError(
      `This network (${networkUrl}) doesn't seem to use Fhevm or use an incompatible version.`,
      e,
    );
  }
  return _instance;
};

// TODO: be able to pass a full configuration, or simply the chain-id/name, or relayer-url
program
  .command('encrypt')
  .argument('<contractAddress>', 'address of the contract')
  .argument('<userAddress>', 'address of the account')
  .argument('<values:bits...>', 'values with number of bits eg: 1:1 3324242:64')
  .requiredOption(
    '-n, --node <url>',
    'url of the blockchain',
    'https://eth-sepolia.public.blastapi.io',
  )
  .action(async (contractAddress, userAddress, valuesArr, options) => {
    const host = prependHttps(options.node);
    const instance = await getInstance(host);
    const encryptedInput = instance.createEncryptedInput(
      contractAddress,
      userAddress,
    );
    valuesArr.forEach((str, i) => {
      const [value, bits] = str.split(':');
      if (!allowedBits.includes(+bits)) throwError('Invalid number of bits');
      const suffix = +bits === 1 ? 'Bool' : bits === '160' ? 'Address' : bits;
      try {
        encryptedInput[`add${suffix}`](parseInt(value, 10));
      } catch (e) {
        return throwError(e.message);
      }
    });
    const result = await encryptedInput.encrypt();

    console.log('Input proof:');
    console.log(`0x${toHexString(result.inputProof)}`);
    console.log('Handles:');
    result.handles.forEach((handle, i) => {
      console.log(`Handle ${i}`);
      console.log(`0x${toHexString(handle)}`);
    });
  });

program.parseAsync();
