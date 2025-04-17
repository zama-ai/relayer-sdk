#!/usr/bin/env node
'use strict';

import { program } from 'commander';
import { toHexString, prependHttps, throwError } from './utils.js';
import { createInstance } from '../lib/node.cjs';

const allowedBits = [1, 4, 8, 16, 32, 64];

const FHE_LIB_ADDRESS = '0x000000000000000000000000000000000000005d';

let _instance;

const getInstance = async (networkUrl) => {
  if (_instance) return _instance;

  try {
    _instance = await createInstance({ networkUrl });
  } catch (e) {
    return throwError(
      `This network (${networkUrl}) doesn't seem to use Fhevm or use an incompatible version.`,
    );
  }
  return _instance;
};

program
  .command('encrypt')
  .argument('<contractAddress>', 'address of the contract')
  .argument('<userAddress>', 'address of the account')
  .argument('<values:bits...>', 'values with number of bits eg: 1:1 3324242:64')
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
  })
  .requiredOption('-n, --node <url>', 'url of the blockchain');

program.parseAsync(process.argv);
