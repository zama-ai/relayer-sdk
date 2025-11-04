/**
 * **FHE Type Mapping for Input Builders**
 * * Maps the **number of encrypted bits** used by a FHEVM primary type
 * to its corresponding **FheTypeId**. This constant is primarily used by
 * `EncryptedInput` and `RelayerEncryptedInput` builders to determine the correct
 * input type and calculate the total required bit-length.
 *
 * **Structure: \{ Encrypted Bit Length: FheTypeId \}**
 *
 * | Bits | FheTypeId | FHE Type Name | Note |
 * | :--- | :-------- | :------------ | :--- |
 * | 2    | 0         | `ebool`         | The boolean type. |
 * | (N/A)| 1         | `euint4`        | **Deprecated** and omitted from this map. |
 * | 8    | 2         | `euint8`        | |
 * | 16   | 3         | `euint16`       | |
 * | 32   | 4         | `euint32`       | |
 * | 64   | 5         | `euint64`       | |
 * | 128  | 6         | `euint128`      | |
 * | 160  | 7         | `eaddress`      | Used for encrypted Ethereum addresses. |
 * | 256  | 8         | `euint256`      | The maximum supported integer size. |
 */
export const ENCRYPTION_TYPES = {
  2: 0, // ebool (FheTypeId=0) is using 2 encrypted bits
  // euint4 (FheTypeId=1) is deprecated
  8: 2, // euint8 (FheTypeId=2) is using 8 encrypted bits
  16: 3, // euint16 (FheTypeId=3) is using 16 encrypted bits
  32: 4, // euint32 (FheTypeId=4) is using 32 encrypted bits
  64: 5, // euint64 (FheTypeId=5) is using 64 encrypted bits
  128: 6, // euint128 (FheTypeId=128) is using 128 encrypted bits
  160: 7, // eaddress (FheTypeId=7) is using 160 encrypted bits
  256: 8, // euint256 (FheTypeId=8) is using 256 encrypted bits
};

export type EncryptionBits = keyof typeof ENCRYPTION_TYPES;
