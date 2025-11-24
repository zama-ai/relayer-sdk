import {
  assertRecordStringProperty,
  assertRecordTimestampProperty,
} from '../../../utils/string';
import { RelayerV2ApiPostError429 } from './types';

/*
  export type RelayerV2ApiPostError429 = {
    code: 'rate_limited';
    message: string;
    retry_after: Timestamp;
    request_id?: string;
  };
*/
export function assertIsRelayerV2ApiPostError429(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiPostError429 {
  assertRecordStringProperty(value, 'code', name, 'rate_limited');
  assertRecordStringProperty(value, 'message', name);
  assertRecordTimestampProperty(value, 'retry_after', name);
  if ('request_id' in value) {
    assertRecordStringProperty(value, 'request_id', name);
  }
}
