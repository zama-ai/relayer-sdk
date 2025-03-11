const waitForFunction =
  (functionName) =>
  async (...params) => {
    if (window && window.httpz) {
      return window.httpz[functionName](...params);
    }
  };

const initHTTPZ = waitForFunction('initHTTPZ');
const createInstance = waitForFunction('createInstance');

export { initHTTPZ, createInstance };
