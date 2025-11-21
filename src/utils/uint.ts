export function isUint(value: any): value is number {
  if (typeof value === 'number') {
    if (value < 0) {
      return false;
    }
    return Number.isInteger(value);
  } else if (typeof value === 'bigint') {
    return value >= 0;
  }
  return false;
}

export function assertIsUint(value: unknown): asserts value is number {
  if (!isUint(value)) {
    throw new RangeError('Invalid uint');
  }
}
