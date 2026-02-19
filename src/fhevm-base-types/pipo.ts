type EmptyObject = Record<string, never>;

interface ExtensibleLib<T> {
  extends<U>(lib: U): ExtensibleLib<T & U> & T & U;
  finalize(): T;
}

export function createNewEmptyLib(): ExtensibleLib<EmptyObject> {
  return _createLib({} as EmptyObject);
}

function _createLib<T>(current: T): ExtensibleLib<T> & T {
  return {
    ...current,
    extends<U>(lib: U): ExtensibleLib<T & U> & T & U {
      return _createLib({ ...current, ...lib });
    },
    finalize(): T {
      return { ...current };
    },
  } as ExtensibleLib<T> & T;
}
