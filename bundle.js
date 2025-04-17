const waitForFunction =
  (functionName) =>
  async (...params) => {
    if (window && window.fhevm) {
      return window.fhevm[functionName](...params);
    }
  };

const initFhevm = waitForFunction('initFhevm');
const createInstance = waitForFunction('createInstance');

export { initFhevm, createInstance };
