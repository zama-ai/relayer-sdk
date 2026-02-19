import type { InputTypedValue } from '@base/typedvalue';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import type {
  ExternalFhevmHandle,
  FhevmConfig,
  InputProof,
  ZKProof,
} from './types/public-api';
import type {
  FHELib,
  FHEPublicKey,
  RelayerFetchOptions,
  RelayerLib,
} from './types/libs';
import type { BytesHex } from '@base/types/primitives';
import { fetchInputProof } from './coprocessor/InputProof';
import { generateZKProof } from './coprocessor/ZKProofBuilder';

export async function encrypt(
  fhevm: {
    readonly config: FhevmConfig;
    readonly fhePublicKey: FHEPublicKey;
    readonly relayerUrl: string;
    readonly libs: {
      readonly fheLib: FHELib;
      readonly relayerLib: RelayerLib;
      readonly eip712Lib: EIP712Lib;
    };
  },
  args: {
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly values: readonly InputTypedValue[];
    readonly extraData: BytesHex;
    readonly options?: RelayerFetchOptions;
  },
): Promise<{
  readonly externalHandles: readonly ExternalFhevmHandle[];
  readonly inputProof: InputProof;
}> {
  const { contractAddress, userAddress, values } = args;
  const zkProof: ZKProof = generateZKProof(fhevm, {
    contractAddress,
    userAddress,
    values,
  });
  const inputProof = await fetchInputProof(fhevm, {
    zkProof,
    extraData: args.extraData,
    options: args.options,
  });
  return {
    externalHandles: inputProof.handles,
  };
}
