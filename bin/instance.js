import { createInstance } from '../lib/node.cjs';
import { logCLI } from './utils.js';

let __instance;

export async function getInstance(config, options) {
  if (!__instance) {
    if (!config) {
      throw new Error('Missing FhevmInstanceConfig');
    }
    logCLI(`create FHEVM instance...`, options);
    __instance = await createInstance(config);
  }
  return __instance;
}
