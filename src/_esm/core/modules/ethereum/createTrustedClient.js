import { createTrustedValue, } from "../../base/trustedValue.js";
export function createTrustedClient(nativeClient, token) {
    const tc = createTrustedValue(nativeClient, token);
    return tc;
}
//# sourceMappingURL=createTrustedClient.js.map