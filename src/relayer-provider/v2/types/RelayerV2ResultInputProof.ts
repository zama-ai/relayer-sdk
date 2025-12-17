import { assertRecordBooleanProperty } from '../../../utils/record';
import {
  assertRecordBytes32HexArrayProperty,
  assertRecordBytesHexArrayProperty,
  assertRecordBytesHexProperty,
} from '../../../utils/bytes';
import type {
  RelayerV2ResultInputProof,
  RelayerV2ResultInputProofAcceped,
  RelayerV2ResultInputProofRejected,
} from './types';

export function assertIsRelayerV2ResultInputProof(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultInputProof {
  assertRecordBooleanProperty(value, 'accepted', name);
  if (value.accepted) {
    assertIsRelayerV2ResultInputProofAccepted(value, name);
  } else {
    assertIsRelayerV2ResultInputProofRejected(value, name);
  }
}
/*
    type RelayerV2ResultInputProofAccepted = {
        accepted: true;
        extra_data: BytesHex;
        handles: Bytes32Hex[];
        signatures: BytesHex[];
    }
*/
export function assertIsRelayerV2ResultInputProofAccepted(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultInputProofAcceped {
  assertRecordBooleanProperty(value, 'accepted', name, true);
  assertRecordBytes32HexArrayProperty(value, 'handles', name);
  assertRecordBytesHexArrayProperty(value, 'signatures', name);
  assertRecordBytesHexProperty(value, 'extraData', name);
}

/*
    type RelayerV2ResultInputProofRejected = {
        accepted: false;
        extra_data: BytesHex;
    }
*/
export function assertIsRelayerV2ResultInputProofRejected(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultInputProofRejected {
  assertRecordBooleanProperty(value, 'accepted', name, false);
  assertRecordBytesHexProperty(value, 'extraData', name);
}
