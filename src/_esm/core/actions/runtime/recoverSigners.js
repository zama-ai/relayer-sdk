import { assertIsBytes65HexArray } from "../../base/bytes.js";
export async function recoverSigners(fhevm, parameters) {
    const { domain, types, primaryType, signatures, message } = parameters;
    assertIsBytes65HexArray(signatures, { subject: "signatures" });
    const fields = types[primaryType];
    if (fields === undefined) {
        throw new Error(`Primary type "${primaryType}" not found in types`);
    }
    const recoveredAddresses = await Promise.all(signatures.map((signature) => fhevm.runtime.ethereum.recoverTypedDataAddress({
        signature,
        // force cast
        domain,
        primaryType,
        types: {
            [primaryType]: [...fields],
        },
        message,
    })));
    return recoveredAddresses;
}
//# sourceMappingURL=recoverSigners.js.map