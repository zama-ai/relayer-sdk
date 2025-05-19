export const ENCRYPTION_TYPES = {
  1: 0, // ebool takes 2 encrypted bits
  8: 2,
  16: 3,
  32: 4,
  64: 5,
  128: 6,
  160: 7,
  256: 8,
  512: 9,
  1024: 10,
  2048: 11,
};

export type EncryptionTypes = keyof typeof ENCRYPTION_TYPES;
