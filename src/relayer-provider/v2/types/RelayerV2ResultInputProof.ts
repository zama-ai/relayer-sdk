import { assertRecordBooleanProperty } from '../../../utils/record';
import {
  assertBytes32HexArrayProperty,
  assertBytesHexArrayProperty,
  assertBytesHexProperty,
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
  assertBytesHexProperty(value, 'extra_data', name);
  assertRecordBooleanProperty(value, 'accepted', name);
  if (value.accepted !== true) {
    throw new Error(`Invalid ${name}.accepted`);
  }
  assertBytes32HexArrayProperty(value, 'handles', name);
  assertBytesHexArrayProperty(value, 'signatures', name);
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
  assertBytesHexProperty(value, 'extra_data', name);
  assertRecordBooleanProperty(value, 'accepted', name);
  if (value.accepted !== false) {
    throw new Error(`Invalid ${name}.accepted`);
  }
}
