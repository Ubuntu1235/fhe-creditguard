import { FhevmInstances, createInstance } from 'fhevmjs';

let instance;

export const createFhevmInstance = async () => {
  if (instance) return instance;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    instance = await createInstance({ chainId, provider });
    return instance;
  } catch (error) {
    console.error('Error creating FHEVM instance:', error);
    throw error;
  }
};

export { FhevmInstances };