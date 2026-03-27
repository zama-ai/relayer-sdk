import { assertRecordBytesHexNo0xProperty } from "../../../../base/bytes.js";
import type { ErrorMetadataParams } from "../../../../base/errors/ErrorBase.js";
import {
  assertRecordArrayProperty,
  assertRecordNonNullableProperty,
} from "../../../../base/record.js";
import { assertRecordStringProperty } from "../../../../base/string.js";
import type {
  RelayerResult200UserDecrypt,
  RelayerUserDecryptSucceeded,
} from "../../../../types/relayer-p.js";

/**
 * Normalize a result item by stripping the 0x prefix from hex fields.
 * Returns a new object — does not mutate the original.
 */
function _normalizeResultItem(
  item: unknown,
): Record<string, unknown> {
  if (item === null || item === undefined || typeof item !== "object") {
    return {};
  }
  const src = item as Record<string, unknown>;
  const normalized: Record<string, unknown> = { ...src };
  for (const key of ["payload", "signature", "extraData"] as const) {
    const val = normalized[key];
    if (typeof val === "string" && val.startsWith("0x")) {
      normalized[key] = val.slice(2);
    }
  }
  return normalized;
}

/**
 * Asserts that `value` matches the {@link RelayerUserDecryptSucceeded} schema:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "result": [{
 *       "payload": "hexNo0x...",
 *       "signature": "hexNo0x...",
 *       "extraData": "hex_or_hexNo0x_?..."
 *     }]
 *   }
 * }
 * ```
 */
export function assertIsRelayerUserDecryptSucceeded(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is RelayerUserDecryptSucceeded {
  type T = RelayerUserDecryptSucceeded;
  assertRecordStringProperty(value, "status" satisfies keyof T, name, {
    expectedValue: "succeeded" satisfies T["status"],
    ...options,
  });
  assertRecordStringProperty(
    value,
    "requestId" satisfies keyof T,
    name,
    options,
  );
  assertRecordNonNullableProperty(
    value,
    "result" satisfies keyof T,
    name,
    options,
  );
  _assertIsRelayerResult200UserDecrypt(value.result, `${name}.result`, options);
}

/**
 * Asserts that `value` matches the {@link RelayerResult200UserDecrypt} schema.
 *
 * Normalizes hex fields by stripping 0x prefixes (the relayer may return
 * either format). Creates normalized copies — does not mutate the original.
 */
function _assertIsRelayerResult200UserDecrypt(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is RelayerResult200UserDecrypt {
  type T = RelayerResult200UserDecrypt;
  type ResultItem = T["result"][number];

  assertRecordArrayProperty(value, "result" satisfies keyof T, name, options);

  // Normalize and validate each result item
  for (let i = 0; i < value.result.length; ++i) {
    const normalized = _normalizeResultItem(value.result[i]);
    // Replace the item with the normalized copy
    value.result[i] = normalized;

    assertRecordBytesHexNo0xProperty(
      normalized,
      "payload" satisfies keyof ResultItem,
      `${name}.result[${i}]`,
      { ...options },
    );
    assertRecordBytesHexNo0xProperty(
      normalized,
      "signature" satisfies keyof ResultItem,
      `${name}.result[${i}]`,
      { ...options },
    );
    // extraData may not be present in newer relayer responses
    if ("extraData" in normalized) {
      assertRecordBytesHexNo0xProperty(
        normalized,
        "extraData" satisfies keyof ResultItem,
        `${name}.result[${i}]`,
        options,
      );
    }
  }
}
