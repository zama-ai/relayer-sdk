import type { TypedValueLike } from '@base/typedvalue';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import type {
  FhevmConfig,
  VerifiedInputProof,
  ZKProof,
} from './types/public-api';
import type { RelayerFetchOptions, RelayerLib, TFHELib } from './types/libs';
import type { BytesHex } from '@base/types/primitives';
import type { TfhePublicEncryptionParams } from './types/private';
import { fetchInputProof } from './coprocessor/InputProof';
import { generateZKProof } from './coprocessor/ZKProofBuilder';

export async function encrypt(
  fhevm: {
    readonly config: FhevmConfig;
    readonly relayerUrl: string;
    readonly libs: {
      readonly tfheLib: TFHELib;
      readonly relayerLib: RelayerLib;
      readonly eip712Lib: EIP712Lib;
    };
  },
  args: {
    readonly tfhePublicEncryptionParams: TfhePublicEncryptionParams;
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly values: readonly TypedValueLike[];
    readonly extraData: BytesHex;
    readonly options?: RelayerFetchOptions;
  },
): Promise<VerifiedInputProof> {
  const { contractAddress, userAddress, values, tfhePublicEncryptionParams } =
    args;

  const zkProof: ZKProof = generateZKProof(fhevm, {
    tfhePublicEncryptionParams,
    contractAddress,
    userAddress,
    values,
  });

  const inputProof = await fetchInputProof(fhevm, {
    zkProof,
    extraData: args.extraData,
    options: args.options,
  });

  return inputProof;
}
