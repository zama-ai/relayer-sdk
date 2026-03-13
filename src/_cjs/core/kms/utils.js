"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertKmsDecryptionBitLimit = assertKmsDecryptionBitLimit;
exports.assertKmsEIP712DeadlineValidity = assertKmsEIP712DeadlineValidity;
const MAX_KMS_DECRYPT_DECRYPTION_BIT_LIMIT = 2048;
function assertKmsDecryptionBitLimit(fhevmHandles) {
    let total = 0;
    for (const fhevmHandle of fhevmHandles) {
        total += fhevmHandle.encryptionBits;
        if (total > MAX_KMS_DECRYPT_DECRYPTION_BIT_LIMIT) {
            throw new Error(`Cannot decrypt more than ${MAX_KMS_DECRYPT_DECRYPTION_BIT_LIMIT} encrypted bits in a single request`);
        }
    }
    return total;
}
function assertKmsEIP712DeadlineValidity({ startTimestamp, durationDays, }, maxDurationDays) {
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