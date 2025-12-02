import { assertRecordStringProperty } from '../../../utils/string';
import { RelayerV2ApiPostError429 } from './types';

/*
  export type RelayerV2ApiPostError429 = {
    label: 'rate_limited';
    message: string;
  };
*/
export function assertIsRelayerV2ApiPostError429(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiPostError429 {
  assertRecordStringProperty(value, 'label', name, 'rate_limited');
  assertRecordStringProperty(value, 'message', name);
}
