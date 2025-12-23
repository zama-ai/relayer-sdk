import {
  TfheCompactPublicKey,
  TfheConfigBuilder,
  TfheClientKey,
  ShortintParameters,
  ShortintParametersName,
  CompactPkeCrs,
  ShortintCompactPublicKeyEncryptionParameters,
  ShortintCompactPublicKeyEncryptionParametersName,
} from 'node-tfhe';
import { bytesToHexNo0x } from './utils/bytes';

export const createTfheKeypair = () => {
  const block_params = new ShortintParameters(
    ShortintParametersName.PARAM_MESSAGE_2_CARRY_2_KS_PBS_TUNIFORM_2M128,
  );
  const casting_params = new ShortintCompactPublicKeyEncryptionParameters(
    ShortintCompactPublicKeyEncryptionParametersName.V1_0_PARAM_PKE_MESSAGE_2_CARRY_2_KS_PBS_TUNIFORM_2M128,
  );
  const config = TfheConfigBuilder.default()
    .use_custom_parameters(block_params)
    .use_dedicated_compact_public_key_parameters(casting_params)
    .build();
  let clientKey = TfheClientKey.generate(config);
  let publicKey = TfheCompactPublicKey.new(clientKey);
  const crs = CompactPkeCrs.from_config(config, 4 * 512);
  return { clientKey, publicKey, crs };
};

export const createTfhePublicKey = (): string => {
  const { publicKey } = createTfheKeypair();
  return bytesToHexNo0x(publicKey.serialize());
};
