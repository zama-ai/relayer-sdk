import { assertNever } from "../../../base/errors/utils.js";
export function humanReadableOperation(relayerOperation, capitalize) {
    switch (relayerOperation) {
        case "INPUT_PROOF":
            return capitalize ? "Input proof" : "input proof";
        case "PUBLIC_DECRYPT":
            return capitalize ? "Public decryption" : "public decryption";
        case "USER_DECRYPT":
            return capitalize ? "User decryption" : "user decryption";
        case "DELEGATED_USER_DECRYPT":
            return capitalize
                ? "Delegated user decryption"
                : "delegated user decryption";
        case "KEY_URL":
            return capitalize ? "Key url" : "key url";
        default: {
            assertNever(relayerOperation, `Unkown operation: ${relayerOperation}`);
        }
    }
}
//# sourceMappingURL=utils.js.map