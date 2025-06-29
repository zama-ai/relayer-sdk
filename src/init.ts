import initTFHE, {
  init_panic_hook,
  initThreadPool,
  InitInput as TFHEInput,
} from 'tfhe';

import initKMS, { InitInput as KMSInput } from 'tkms';
// import wasmKMS from 'tkms/kms_lib_bg.wasm';
import { threads } from 'wasm-feature-detect';

export { KMSInput, TFHEInput };

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
    await initTFHE({ module_or_path: tfheParams });
    await initKMS({
      module_or_path: kmsParams,
    });
    if (thread) {
      init_panic_hook();
      await initThreadPool(thread);
    }
    initialized = true;
  }
  return true;
};
