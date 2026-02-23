import type { InitInput as TFHEInput } from 'tfhe';
import type { InitInput as KMSInput } from 'tkms';

import { TFHE as TFHEModule } from '@sdk/wasm-modules';
import { TKMS as TKMSModule } from '@sdk/wasm-modules';

import { threads } from 'wasm-feature-detect';

export type { KMSInput, TFHEInput };

let initialized = false;

export const initSDK = async ({
  tfheParams,
  kmsParams,
  thread,
}: {
  tfheParams?: TFHEInput;
  kmsParams?: KMSInput;
  thread?: number;
} = {}) => {
  if (
    !TFHEModule.initTFHE ||
    !TKMSModule.initTKMS ||
    !TFHEModule.initThreadPool
  ) {
    throw new Error('Unable to load TFHE or TKMS web wasm modules');
  }

  if (thread == null) thread = navigator.hardwareConcurrency;
  let supportsThreads = await threads();
  if (!supportsThreads) {
    console.warn(
      'This browser does not support threads. Verify that your server returns correct headers:\n',
      "'Cross-Origin-Opener-Policy': 'same-origin'\n",
      "'Cross-Origin-Embedder-Policy': 'require-corp'",
    );
    thread = undefined;
  }
  if (!initialized) {
    await TFHEModule.initTFHE({ module_or_path: tfheParams });
    await TKMSModule.initTKMS({
      module_or_path: kmsParams,
    });
    if (thread) {
      TFHEModule.init_panic_hook();
      await TFHEModule.initThreadPool(thread);
    }
    initialized = true;
  }
  return true;
};
