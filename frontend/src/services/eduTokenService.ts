import { ethers } from 'ethers';

/**
 * Get the token balance of an address
 * @param contract The EduToken contract instance
 * @param address The address to check the balance of
 * @returns The token balance in wei
 */
export const getBalance = async (
  contract: ethers.Contract,
  address: string
): Promise<string> => {
  try {
    const balance = await contract.balanceOf(address);
    return balance.toString();
  } catch (error: any) {
    console.error('Error getting token balance:', error);
    throw error;
  }
};

/**
 * Get the staked token balance of an address
 * @param contract The EduToken contract instance
 * @param address The address to check the staked balance of
 * @returns The staked token balance in wei
 */
export const getStakedBalance = async (
  contract: ethers.Contract,
  address: string
): Promise<string> => {
  try {
    const stakedBalance = await contract.stakedBalance(address);
    return stakedBalance.toString();
  } catch (error: any) {
    console.error('Error getting staked token balance:', error);
    throw error;
  }
};

/**
 * Check if an address is eligible for DAO participation
 * @param contract The EduToken contract instance
 * @param address The address to check eligibility for
 * @param requiredStake The required stake amount in wei
 * @returns Whether the address is eligible for DAO participation
 */
export const isEligibleForDAO = async (
  contract: ethers.Contract,
  address: string,
  requiredStake: string
): Promise<boolean> => {
  try {
    return await contract.isEligibleForDAO(address, requiredStake);
  } catch (error: any) {
    console.error('Error checking DAO eligibility:', error);
    throw error;
  }
};

/**
 * Mint tokens to an address
 * @param contract The EduToken contract instance
 * @param to The address to mint tokens to
 * @param amount The amount of tokens to mint in wei
 * @returns The transaction receipt
 */
export const mintTokens = async (
  contract: ethers.Contract,
  to: string,
  amount: string
): Promise<ethers.TransactionReceipt> => {
  try {
    console.log('Minting tokens with params:', { to, amount });
    console.log('Contract address:', contract.target);

    // Check if the caller is the owner of the contract
    try {
      const owner = await contract.owner();
      const signer = contract.runner as ethers.Signer;
      const signerAddress = await signer.getAddress();
      console.log('Contract owner:', owner);
      console.log('Signer address:', signerAddress);

      if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        console.warn(`Warning: You are not the contract owner. Owner: ${owner}, You: ${signerAddress}`);
        console.warn('Only the owner can mint tokens. This transaction will likely fail.');
      }
    } catch (error: any) {
      console.error('Error checking ownership:', error);
    }

    // Send the mint transaction
    const tx = await contract.mint(to, amount, {
      gasLimit: 300000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return receipt;
  } catch (error: any) {
    console.error('Error minting tokens:', error);
    // Provide more detailed error information
    if (error.reason) {
      throw new Error(`Contract error: ${error.reason}`);
    } else if (error.message) {
      throw new Error(`Error: ${error.message}`);
    } else {
      throw error;
    }
  }
};

/**
 * Stake tokens
 * @param contract The EduToken contract instance
 * @param amount The amount of tokens to stake in wei
 * @returns The transaction receipt
 */
export const stakeTokens = async (
  contract: ethers.Contract,
  amount: string
): Promise<ethers.TransactionReceipt> => {
  try {
    console.log('Staking tokens with amount:', amount);
    console.log('Contract address:', contract.target);

    // Send the stake transaction
    const tx = await contract.stake(amount, {
      gasLimit: 300000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return receipt;
  } catch (error: any) {
    console.error('Error staking tokens:', error);
    // Provide more detailed error information
    if (error.reason) {
      throw new Error(`Contract error: ${error.reason}`);
    } else if (error.message) {
      throw new Error(`Error: ${error.message}`);
    } else {
      throw error;
    }
  }
};

/**
 * Unstake tokens
 * @param contract The EduToken contract instance
 * @param amount The amount of tokens to unstake in wei
 * @returns The transaction receipt
 */
export const unstakeTokens = async (
  contract: ethers.Contract,
  amount: string
): Promise<ethers.TransactionReceipt> => {
  try {
    console.log('Unstaking tokens with amount:', amount);
    console.log('Contract address:', contract.target);

    // Send the unstake transaction
    const tx = await contract.unstake(amount, {
      gasLimit: 300000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return receipt;
  } catch (error: any) {
    console.error('Error unstaking tokens:', error);
    // Provide more detailed error information
    if (error.reason) {
      throw new Error(`Contract error: ${error.reason}`);
    } else if (error.message) {
      throw new Error(`Error: ${error.message}`);
    } else {
      throw error;
    }
  }
};

/**
 * Transfer tokens to another address
 * @param contract The EduToken contract instance
 * @param to The address to transfer tokens to
 * @param amount The amount of tokens to transfer in wei
 * @returns The transaction receipt
 */
export const transferTokens = async (
  contract: ethers.Contract,
  to: string,
  amount: string
): Promise<ethers.TransactionReceipt> => {
  try {
    console.log('Transferring tokens with params:', { to, amount });
    console.log('Contract address:', contract.target);

    // Send the transfer transaction
    const tx = await contract.transfer(to, amount, {
      gasLimit: 300000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return receipt;
  } catch (error: any) {
    console.error('Error transferring tokens:', error);
    // Provide more detailed error information
    if (error.reason) {
      throw new Error(`Contract error: ${error.reason}`);
    } else if (error.message) {
      throw new Error(`Error: ${error.message}`);
    } else {
      throw error;
    }
  }
};

/**
 * Get the total supply of tokens
 * @param contract The EduToken contract instance
 * @returns The total supply of tokens in wei
 */
export const getTotalSupply = async (
  contract: ethers.Contract
): Promise<string> => {
  try {
    const totalSupply = await contract.totalSupply();
    return totalSupply.toString();
  } catch (error: any) {
    console.error('Error getting total supply:', error);
    throw error;
  }
};

/**
 * Get the total staked tokens
 * @param contract The EduToken contract instance
 * @returns The total staked tokens in wei
 */
export const getTotalStaked = async (
  contract: ethers.Contract
): Promise<string> => {
  try {
    const totalStaked = await contract.totalStaked();
    return totalStaked.toString();
  } catch (error: any) {
    console.error('Error getting total staked:', error);
    throw error;
  }
};

// Mock implementations for fallback
export const getBalanceMock = async (
  _contract: ethers.Contract | null,
  _address: string
): Promise<string> => {
  return (Math.floor(Math.random() * 100) * 1e18).toString();
};

export const getStakedBalanceMock = async (
  _contract: ethers.Contract | null,
  _address: string
): Promise<string> => {
  return (Math.floor(Math.random() * 50) * 1e18).toString();
};

export const isEligibleForDAOMock = async (
  _contract: ethers.Contract | null,
  _address: string,
  _requiredStake: string
): Promise<boolean> => {
  return Math.random() > 0.3; // 70% chance of being eligible
};

export const mintTokensMock = async (
  _contract: ethers.Contract | null,
  to: string,
  amount: string
): Promise<any> => {
  console.log('MOCK: Minting tokens with params:', { to, amount });
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };
};

export const stakeTokensMock = async (
  _contract: ethers.Contract | null,
  amount: string
): Promise<any> => {
  console.log('MOCK: Staking tokens with amount:', amount);
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };
};

export const unstakeTokensMock = async (
  _contract: ethers.Contract | null,
  amount: string
): Promise<any> => {
  console.log('MOCK: Unstaking tokens with amount:', amount);
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };
};

export const transferTokensMock = async (
  _contract: ethers.Contract | null,
  to: string,
  amount: string
): Promise<any> => {
  console.log('MOCK: Transferring tokens with params:', { to, amount });
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };
};

export const getTotalSupplyMock = async (): Promise<string> => {
  return (1000000 * 1e18).toString();
};

export const getTotalStakedMock = async (): Promise<string> => {
  return (500000 * 1e18).toString();
};
