import type { Address, Bytes20, ChecksummedAddress } from "../types/primitives.js";
import type { RecordAddressPropertyType, RecordChecksummedAddressArrayPropertyType, RecordChecksummedAddressPropertyType } from "../types/record-p.js";
import type { ErrorMetadataParams } from "./errors/ErrorBase.js";
export declare const ZERO_ADDRESS: ChecksummedAddress;
/**
 * Converts a checksummed Ethereum address to its raw 20-byte representation.
 *
 * @param address - A valid EIP-55 checksummed address
 * @returns The 20-byte Uint8Array representation
 */
export declare function checksummedAddressToBytes20(address: ChecksummedAddress): Bytes20;
/**
 * Type guard that checks if a value is a valid EIP-55 checksummed Ethereum address.
 *
 * @param value - The value to check
 * @returns True if the value is a valid checksummed address
 */
export declare function isChecksummedAddress(value: unknown): value is ChecksummedAddress;
export declare function assertIsChecksummedAddress(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is ChecksummedAddress;
export declare function asChecksummedAddress(value: unknown, options?: ErrorMetadataParams): ChecksummedAddress;
export declare function assertIsChecksummedAddressArray(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is ChecksummedAddress[];
export declare function isAddress(value: unknown): value is Address;
export declare function asAddress(value: unknown, options?: ErrorMetadataParams): Address;
export declare function assertIsAddress(value: unknown, options: ErrorMetadataParams): asserts value is Address;
export declare function assertIsAddressArray(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Address[];
export declare function isRecordAddressProperty<K extends string>(record: unknown, property: K): record is RecordAddressPropertyType<K>;
export declare function assertRecordAddressProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordAddressPropertyType<K>;
export declare function isRecordChecksummedAddressProperty<K extends string>(record: unknown, property: K): record is RecordChecksummedAddressPropertyType<K>;
export declare function assertRecordChecksummedAddressProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordChecksummedAddressPropertyType<K>;
export declare function assertRecordChecksummedAddressArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordChecksummedAddressArrayPropertyType<K>;
/**
 * Converts an Ethereum address to its EIP-55 checksummed format.
 *
 * @param value - The 0x-prefixed address to checksum
 * @returns The checksummed address, or undefined if invalid
 */
export declare function toChecksummedAddress(value: unknown): ChecksummedAddress | undefined;
/**
 * Converts an Ethereum address to its EIP-55 checksummed format.
 *
 * @param address - The 0x-prefixed address to checksum
 * @returns The checksummed address, or undefined if invalid
 */
export declare function addressToChecksummedAddress(address: Address): ChecksummedAddress;
export declare function _toChecksummedAddress(bytes20No0xLowerCase: string): ChecksummedAddress;
//# sourceMappingURL=address.d.ts.map