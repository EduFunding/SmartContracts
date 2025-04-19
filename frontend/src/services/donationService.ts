import { ethers } from 'ethers';
import { mintNFT, mintNFTMock } from './eduNFTService';
import { mintTokens, mintTokensMock } from './eduTokenService';

export interface Donation {
  amount: number;
  timestamp: number;
}

/**
 * Make a donation to the DonationVault contract, mint an NFT, and mint EduTokens
 * @param contract The DonationVault contract instance
 * @param eduNFTContract The EduNFT contract instance
 * @param eduTokenContract The EduToken contract instance
 * @param amount The amount to donate in wei
 * @returns An object containing the donation receipt, the NFT ID, and the token amount
 */
export const makeDonation = async (
  contract: ethers.Contract,
  eduNFTContract: ethers.Contract,
  eduTokenContract: ethers.Contract,
  amount: string
): Promise<{ receipt: ethers.TransactionReceipt; nftId: number; tokenAmount: string }> => {
  try {
    console.log('Making donation with amount:', amount);
    console.log('Contract address:', contract.target);

    // Send the donation transaction
    const tx = await contract.donate({
      value: amount,
      gasLimit: 300000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    // After successful donation, mint an NFT for the donor
    const signer = contract.runner as ethers.Signer;
    const donorAddress = await signer.getAddress();

    // Create a metadata URI for the NFT
    const metadataURI = `ipfs://QmDonationNFT/${Date.now()}`;

    // Mint the NFT
    console.log('Minting donation NFT for donor:', donorAddress);
    const nftId = await mintNFT(eduNFTContract, donorAddress, metadataURI, amount);
    console.log('Donation NFT minted with ID:', nftId);

    // Calculate token amount to mint (1 ETH = 100 EDU tokens)
    const tokenAmount = (BigInt(amount) * BigInt(100) / BigInt(1e18)).toString();
    const tokenAmountInWei = ethers.parseEther(tokenAmount);

    // Mint EduTokens for the donor
    console.log('Minting EduTokens for donor:', donorAddress);
    await mintTokens(eduTokenContract, donorAddress, tokenAmountInWei.toString());
    console.log(`${tokenAmount} EduTokens minted for donor`);

    return { receipt, nftId, tokenAmount };
  } catch (error: any) {
    console.error('Error making donation:', error);
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
 * Release funds from the DonationVault contract to a recipient
 * @param contract The DonationVault contract instance
 * @param recipient The recipient address
 * @param amount The amount to release in wei
 * @returns The transaction receipt
 */
export const releaseFunds = async (
  contract: ethers.Contract,
  recipient: string,
  amount: string
): Promise<ethers.TransactionReceipt> => {
  try {
    console.log('Releasing funds with params:', { recipient, amount });
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
        console.warn('Only the owner can release funds. This transaction will likely fail.');
      }
    } catch (error: any) {
      console.error('Error checking ownership:', error);
    }

    // Send the release funds transaction
    const tx = await contract.releaseFunds(recipient, amount, {
      gasLimit: 300000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return receipt;
  } catch (error: any) {
    console.error('Error releasing funds:', error);
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
 * Get the total donations made to the DonationVault contract
 * @param contract The DonationVault contract instance
 * @returns The total donations in wei
 */
export const getTotalDonations = async (
  contract: ethers.Contract
): Promise<string> => {
  try {
    const totalDonations = await contract.totalDonations();
    return totalDonations.toString();
  } catch (error: any) {
    console.error('Error getting total donations:', error);
    throw error;
  }
};

/**
 * Get the number of donors who have donated to the DonationVault contract
 * @param contract The DonationVault contract instance
 * @returns The number of donors
 */
export const getNumberOfDonors = async (
  contract: ethers.Contract
): Promise<number> => {
  try {
    const numberOfDonors = await contract.numberOfDonors();
    return Number(numberOfDonors);
  } catch (error: any) {
    console.error('Error getting number of donors:', error);
    throw error;
  }
};

/**
 * Get the total amount donated by a specific user
 * @param contract The DonationVault contract instance
 * @param donor The donor address
 * @returns The total amount donated by the user in wei
 */
export const getTotalDonatedByUser = async (
  contract: ethers.Contract,
  donor: string
): Promise<string> => {
  try {
    const totalDonated = await contract.totalDonatedByUser(donor);
    return totalDonated.toString();
  } catch (error: any) {
    console.error('Error getting total donated by user:', error);
    throw error;
  }
};

/**
 * Get all donations made by a specific user
 * @param contract The DonationVault contract instance
 * @param donor The donor address
 * @returns An array of donations made by the user
 */
export const getDonationsByUser = async (
  contract: ethers.Contract,
  donor: string
): Promise<Donation[]> => {
  try {
    const donations = await contract.getDonationsByUser(donor);
    return donations.map((donation: any) => ({
      amount: Number(donation.amount),
      timestamp: Number(donation.timestamp)
    }));
  } catch (error: any) {
    console.error('Error getting donations by user:', error);
    throw error;
  }
};

/**
 * Get the latest donation made by a specific user
 * @param contract The DonationVault contract instance
 * @param donor The donor address
 * @returns The latest donation made by the user
 */
export const getLatestDonation = async (
  contract: ethers.Contract,
  donor: string
): Promise<Donation> => {
  try {
    const donation = await contract.getLatestDonation(donor);
    return {
      amount: Number(donation.amount),
      timestamp: Number(donation.timestamp)
    };
  } catch (error: any) {
    console.error('Error getting latest donation:', error);
    throw error;
  }
};

// Mock implementations for fallback
export const makeDonationMock = async (
  _contract: ethers.Contract | null,
  _eduNFTContract: ethers.Contract | null,
  _eduTokenContract: ethers.Contract | null,
  amount: string
): Promise<{ receipt: any; nftId: number; tokenAmount: string }> => {
  console.log('MOCK: Making donation with amount:', amount);

  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const receipt = {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };

  // Simulate minting an NFT
  console.log('MOCK: Minting donation NFT');
  const metadataURI = `ipfs://QmDonationNFT/${Date.now()}`;
  const nftId = await mintNFTMock(_eduNFTContract, 'mock-address', metadataURI, amount);
  console.log('MOCK: Donation NFT minted with ID:', nftId);

  // Calculate token amount to mint (1 ETH = 100 EDU tokens)
  const tokenAmount = (BigInt(amount) * BigInt(100) / BigInt(1e18)).toString();
  const tokenAmountInWei = ethers.parseEther(tokenAmount);

  // Simulate minting EduTokens
  console.log('MOCK: Minting EduTokens');
  await mintTokensMock(_eduTokenContract, 'mock-address', tokenAmountInWei.toString());
  console.log(`MOCK: ${tokenAmount} EduTokens minted`);

  return { receipt, nftId, tokenAmount };
};

export const releaseFundsMock = async (
  _contract: ethers.Contract | null,
  recipient: string,
  amount: string
): Promise<any> => {
  console.log('MOCK: Releasing funds with params:', { recipient, amount });

  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };
};

export const getTotalDonationsMock = async (): Promise<string> => {
  return (Math.floor(Math.random() * 10) * 1e18).toString();
};

export const getNumberOfDonorsMock = async (): Promise<number> => {
  return Math.floor(Math.random() * 100);
};

export const getTotalDonatedByUserMock = async (
  _contract: ethers.Contract | null,
  _donor: string
): Promise<string> => {
  return (Math.floor(Math.random() * 5) * 1e18).toString();
};

export const getDonationsByUserMock = async (
  _contract: ethers.Contract | null,
  _donor: string
): Promise<Donation[]> => {
  const numDonations = Math.floor(Math.random() * 5) + 1;
  const donations: Donation[] = [];

  for (let i = 0; i < numDonations; i++) {
    donations.push({
      amount: Math.floor(Math.random() * 1e18),
      timestamp: Date.now() - i * 86400000 // i days ago
    });
  }

  return donations;
};

export const getLatestDonationMock = async (
  _contract: ethers.Contract | null,
  _donor: string
): Promise<Donation> => {
  return {
    amount: Math.floor(Math.random() * 1e18),
    timestamp: Date.now()
  };
};
