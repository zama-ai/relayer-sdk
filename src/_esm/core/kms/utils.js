const MAX_KMS_DECRYPT_DECRYPTION_BIT_LIMIT = 2048;
/**
 * Asserts that the total encrypted bits across the given handles does not
 * exceed the maximum number of bits the KMS is able to decrypt in a single call.
 *
 * @param fhevmHandles - Handles to sum encrypted bits for
 * @returns The total encrypted bits across all handles
 * @throws {Error} If the total exceeds the limit
 */
export function assertKmsDecryptionBitLimit(fhevmHandles) {
    let total = 0;
    for (const fhevmHandle of fhevmHandles) {
        total += fhevmHandle.encryptionBits;
        if (total > MAX_KMS_DECRYPT_DECRYPTION_BIT_LIMIT) {
            throw new Error(`Cannot decrypt more than ${MAX_KMS_DECRYPT_DECRYPTION_BIT_LIMIT} encrypted bits in a single request`);
        }
    }
    return total;
}
export function assertKmsEIP712DeadlineValidity({ startTimestamp, durationDays, }, maxDurationDays) {
    if (durationDays === 0) {
        throw Error("durationDays is null");
    }
    const durationDaysBigInt = BigInt(durationDays);
    if (durationDaysBigInt > BigInt(maxDurationDays)) {
        throw Error(`durationDays is above max duration of ${maxDurationDays}`);
    }
    const startTimestampBigInt = BigInt(startTimestamp);
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    if (startTimestampBigInt > currentTimestamp) {
        throw Error("startTimestamp is set in the future");
    }
    const durationInSeconds = durationDaysBigInt * BigInt(86400);
    if (startTimestampBigInt + durationInSeconds < currentTimestamp) {
        throw Error("request has expired");
    }
}
//# sourceMappingURL=utils.js.map