import { assertRecordStringProperty } from '../../../../utils/string';
import { RelayerV2ResponseApiError503 } from '../types';

/*
    export type RelayerV2ApiError503 = {
      label: "protocol_paused" | "gateway_not_reachable";
      message: string;
    };
*/
export function assertIsRelayerV2ApiError503(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseApiError503 {
  assertRecordStringProperty(value, 'label', name, [
    'protocol_paused',
    'gateway_not_reachable',
  ]);
  assertRecordStringProperty(value, 'message', name);
}
