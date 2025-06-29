export const prependHttps = (host) => {
  if (!/^https?:\/\//i.test(host)) {
    return 'https://' + host;
  }
  return host;
};

export const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const throwError = (error, cause) => {
  if (cause) {
    console.error(`Error: ${error} with cause: ${cause}`);
  } else {
    console.error(`Error: ${error}`);
  }
  process.exit();
};
