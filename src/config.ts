import type { Eip1193Provider } from 'ethers';
import { BrowserProvider, JsonRpcProvider } from 'ethers';

export const getProvider = (network: string | Eip1193Provider | undefined) => {
  if (typeof network === 'string') {
    return new JsonRpcProvider(network);
  } else if (network) {
    return new BrowserProvider(network);
  }
  throw new Error(
    'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
  );
};
