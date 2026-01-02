import { assertRecordBooleanProperty } from '@base/record';
import {
  assertRecordBytes32HexArrayProperty,
  assertRecordBytesHexArrayProperty,
  assertRecordBytesHexProperty,
} from '@base/bytes';
import type {
  RelayerV2ResultInputProof,
  RelayerV2ResultInputProofAccepted,
  RelayerV2ResultInputProofRejected,
} from '../types';

export function assertIsRelayerV2ResultInputProof(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultInputProof {
  type T = RelayerV2ResultInputProof;

  assertRecordBooleanProperty(value, 'accepted' satisfies keyof T, name);
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
): asserts value is RelayerV2ResultInputProofAccepted {
  type T = RelayerV2ResultInputProofAccepted;

  assertRecordBooleanProperty(value, 'accepted' satisfies keyof T, name, true);
  assertRecordBytes32HexArrayProperty(value, 'handles' satisfies keyof T, name);
  assertRecordBytesHexArrayProperty(
    value,
    'signatures' satisfies keyof T,
    name,
  );
  assertRecordBytesHexProperty(value, 'extraData' satisfies keyof T, name);
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
  type T = RelayerV2ResultInputProofRejected;

  assertRecordBooleanProperty(value, 'accepted' satisfies keyof T, name, false);
  assertRecordBytesHexProperty(value, 'extraData' satisfies keyof T, name);
}
