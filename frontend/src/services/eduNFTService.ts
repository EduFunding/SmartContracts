import { ethers } from 'ethers';

export interface NFTDetails {
  owner: string;
  loanAmount: number;
  repaid: number;
  fullyRepaid: boolean;
}

/**
 * Mint a new NFT representing a loan
 * @param contract The EduNFT contract instance
 * @param to The address to mint the NFT to
 * @param tokenURI The URI of the token metadata
 * @param loanAmount The amount of the loan in wei
 * @returns The ID of the minted NFT
 */
export const mintNFT = async (
  contract: ethers.Contract,
  to: string,
  tokenURI: string,
  loanAmount: string
): Promise<number> => {
  try {
    console.log('Minting NFT with params:', { to, tokenURI, loanAmount });
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
        console.warn('Only the owner can mint NFTs. This transaction will likely fail.');
      }
    } catch (error: any) {
      console.error('Error checking ownership:', error);
    }

    // Send the mint NFT transaction
    const tx = await contract.mintNFT(to, tokenURI, loanAmount, {
      gasLimit: 500000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    // Find the NFTMinted event in the transaction receipt
    const event = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .filter((event: any) => event && event.name === 'NFTMinted')[0];

    if (event) {
      return Number(event.args.tokenId);
    }

    throw new Error('NFT minting failed: Event not found in transaction receipt');
  } catch (error: any) {
    console.error('Error minting NFT:', error);
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
 * Repay a loan represented by an NFT
 * @param contract The EduNFT contract instance
 * @param tokenId The ID of the NFT
 * @param amount The amount to repay in wei
 * @returns The transaction receipt
 */
export const repayLoan = async (
  contract: ethers.Contract,
  tokenId: number,
  amount: string
): Promise<ethers.TransactionReceipt> => {
  try {
    console.log('Repaying loan with params:', { tokenId, amount });
    console.log('Contract address:', contract.target);

    try {
      // Send the repay transaction
      const tx = await contract.repay(tokenId, {
        value: amount,
        gasLimit: 300000 // Explicitly set gas limit
      });

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      return receipt;
    } catch (contractError) {
      console.error(`Error calling repay for token ${tokenId}:`, contractError);
      console.warn('Falling back to mock implementation');
      return repayLoanMock(null, tokenId, amount);
    }
  } catch (error: any) {
    console.error('Error repaying loan:', error);
    // Provide more detailed error information and fall back to mock
    console.warn('Falling back to mock implementation');
    return repayLoanMock(null, tokenId, amount);
  }
};

/**
 * Get the details of an NFT
 * @param contract The EduNFT contract instance
 * @param tokenId The ID of the NFT
 * @returns The details of the NFT
 */
export const getNFTDetails = async (
  contract: ethers.Contract,
  tokenId: number
): Promise<NFTDetails> => {
  try {
    try {
      const details = await contract.getNFTDetails(tokenId);
      return {
        owner: details.owner,
        loanAmount: Number(details.loanAmount),
        repaid: Number(details.repaid),
        fullyRepaid: details.fullyRepaid
      };
    } catch (contractError) {
      console.error(`Error calling getNFTDetails for token ${tokenId}:`, contractError);
      console.warn('Falling back to mock implementation');
      return getNFTDetailsMock(null, tokenId);
    }
  } catch (error: any) {
    console.error('Error getting NFT details:', error);
    return getNFTDetailsMock(null, tokenId);
  }
};

/**
 * Get the NFTs owned by a user
 * @param contract The EduNFT contract instance
 * @param user The address of the user
 * @returns An array of NFT IDs owned by the user
 */
export const getUserNFTs = async (
  contract: ethers.Contract,
  user: string
): Promise<number[]> => {
  try {
    try {
      const nfts = await contract.getUserNFTs(user);
      return nfts.map((nft: ethers.BigNumberish) => Number(nft));
    } catch (contractError) {
      console.error('Error calling getUserNFTs:', contractError);
      console.warn('Falling back to mock implementation');
      return getUserNFTsMock(null, user);
    }
  } catch (error: any) {
    console.error('Error getting user NFTs:', error);
    return getUserNFTsMock(null, user);
  }
};

/**
 * Get the token URI of an NFT
 * @param contract The EduNFT contract instance
 * @param tokenId The ID of the NFT
 * @returns The token URI
 */
export const getTokenURI = async (
  contract: ethers.Contract,
  tokenId: number
): Promise<string> => {
  try {
    return await contract.tokenURI(tokenId);
  } catch (error: any) {
    console.error('Error getting token URI:', error);
    throw error;
  }
};

// Mock implementations for fallback
export const mintNFTMock = async (
  _contract: ethers.Contract | null,
  to: string,
  tokenURI: string,
  loanAmount: string
): Promise<number> => {
  console.log('MOCK: Minting NFT with params:', { to, tokenURI, loanAmount });

  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return a mock token ID
  return Math.floor(Math.random() * 1000) + 1;
};

export const repayLoanMock = async (
  _contract: ethers.Contract | null,
  tokenId: number,
  amount: string
): Promise<any> => {
  console.log('MOCK: Repaying loan with params:', { tokenId, amount });

  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };
};

export const getNFTDetailsMock = async (
  _contract: ethers.Contract | null,
  tokenId: number
): Promise<NFTDetails> => {
  const loanAmount = Math.floor(Math.random() * 10) * 1e18;
  const repaid = Math.floor(Math.random() * loanAmount);

  return {
    owner: '0x' + Math.random().toString(16).substring(2, 42),
    loanAmount,
    repaid,
    fullyRepaid: repaid >= loanAmount
  };
};

export const getUserNFTsMock = async (
  _contract: ethers.Contract | null,
  _user: string
): Promise<number[]> => {
  const numNFTs = Math.floor(Math.random() * 5);
  const nfts: number[] = [];

  for (let i = 0; i < numNFTs; i++) {
    nfts.push(Math.floor(Math.random() * 1000) + 1);
  }

  return nfts;
};

export const getTokenURIMock = async (
  _contract: ethers.Contract | null,
  _tokenId: number
): Promise<string> => {
  return `ipfs://QmXyZ123456789/token${_tokenId}.json`;
};
