import { ethers } from 'ethers';
import { mintNFT, mintNFTMock } from './eduNFTService';

export enum Role {
  STUDENT = 0,
  SCHOOL = 1
}

export interface Application {
  applicant: string;
  role: Role;
  metadataURI: string;
  applicationHash: string;
  verified: boolean;
  approved: boolean;
  nftId: number;
}

export interface RepaymentDetails {
  totalLoan: number;
  amountRepaid: number;
  fullyRepaid: boolean;
}

/**
 * Submit an application to the EduFunding contract
 * @param contract The EduFunding contract instance
 * @param role The role of the applicant (STUDENT or SCHOOL)
 * @param metadataURI The URI of the metadata for the application
 * @param appHash The hash of the application data
 * @returns The transaction receipt
 */
export const submitApplication = async (
  contract: ethers.Contract,
  role: Role,
  metadataURI: string,
  appHash: string
): Promise<ethers.TransactionReceipt> => {
  try {
    console.log('Submitting application with params:', { role, metadataURI, appHash });
    console.log('Contract address:', contract.target);

    // Send the submit application transaction
    const tx = await contract.submitApplication(role, metadataURI, appHash, {
      gasLimit: 500000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return receipt;
  } catch (error: any) {
    console.error('Error submitting application:', error);
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
 * Approve an application in the EduFunding contract and mint an NFT
 * @param contract The EduFunding contract instance
 * @param eduNFTContract The EduNFT contract instance
 * @param applicant The address of the applicant
 * @param loanAmount The amount of the loan to approve
 * @returns An object containing the approval receipt and the NFT ID
 */
export const approveApplication = async (
  contract: ethers.Contract,
  eduNFTContract: ethers.Contract,
  applicant: string,
  loanAmount: string
): Promise<{ receipt: ethers.TransactionReceipt; nftId: number }> => {
  try {
    console.log('Approving application with params:', { applicant, loanAmount });
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
        console.warn('Only the owner can approve applications. This transaction will likely fail.');
      }
    } catch (error: any) {
      console.error('Error checking ownership:', error);
    }

    // Send the approve application transaction
    const tx = await contract.approveApplication(applicant, loanAmount, {
      gasLimit: 500000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    // After successful approval, mint an NFT for the applicant
    // Create a metadata URI for the NFT
    const metadataURI = `ipfs://QmEducationNFT/${Date.now()}`;

    // Mint the NFT
    console.log('Minting education NFT for applicant:', applicant);
    const nftId = await mintNFT(eduNFTContract, applicant, metadataURI, loanAmount);
    console.log('Education NFT minted with ID:', nftId);

    return { receipt, nftId };
  } catch (error: any) {
    console.error('Error approving application:', error);
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
 * Repay a loan in the EduFunding contract
 * @param contract The EduFunding contract instance
 * @param nftId The ID of the NFT representing the loan
 * @param amount The amount to repay in wei
 * @returns The transaction receipt
 */
export const repayLoan = async (
  contract: ethers.Contract,
  nftId: number,
  amount: string
): Promise<ethers.TransactionReceipt> => {
  try {
    console.log('Repaying loan with params:', { nftId, amount });
    console.log('Contract address:', contract.target);

    // Send the repay loan transaction
    const tx = await contract.repayLoan(nftId, {
      value: amount,
      gasLimit: 300000 // Explicitly set gas limit
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return receipt;
  } catch (error: any) {
    console.error('Error repaying loan:', error);
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
 * Get the details of an application
 * @param contract The EduFunding contract instance
 * @param applicant The address of the applicant
 * @returns The application details
 */
export const getApplication = async (
  contract: ethers.Contract,
  applicant: string
): Promise<Application> => {
  try {
    const application = await contract.applications(applicant);
    return {
      applicant: application.applicant,
      role: application.role,
      metadataURI: application.metadataURI,
      applicationHash: application.applicationHash,
      verified: application.verified,
      approved: application.approved,
      nftId: Number(application.nftId)
    };
  } catch (error: any) {
    console.error('Error getting application:', error);
    throw error;
  }
};

/**
 * Check if an address has applied
 * @param contract The EduFunding contract instance
 * @param applicant The address of the applicant
 * @returns Whether the address has applied
 */
export const hasApplied = async (
  contract: ethers.Contract,
  applicant: string
): Promise<boolean> => {
  try {
    return await contract.hasApplied(applicant);
  } catch (error: any) {
    console.error('Error checking if address has applied:', error);
    throw error;
  }
};

/**
 * Get the NFTs owned by an applicant
 * @param contract The EduFunding contract instance
 * @param applicant The address of the applicant
 * @returns An array of NFT IDs owned by the applicant
 */
export const getApplicantNFTs = async (
  contract: ethers.Contract,
  applicant: string
): Promise<number[]> => {
  try {
    const nfts = await contract.getApplicantNFTs(applicant);
    return nfts.map((nft: ethers.BigNumberish) => Number(nft));
  } catch (error: any) {
    console.error('Error getting applicant NFTs:', error);
    throw error;
  }
};

/**
 * Get the repayment details for a loan
 * @param contract The EduFunding contract instance
 * @param nftId The ID of the NFT representing the loan
 * @returns The repayment details
 */
export const getRepaymentDetails = async (
  contract: ethers.Contract,
  nftId: number
): Promise<RepaymentDetails> => {
  try {
    const details = await contract.getRepaymentDetails(nftId);
    return {
      totalLoan: Number(details.totalLoan),
      amountRepaid: Number(details.amountRepaid),
      fullyRepaid: details.fullyRepaid
    };
  } catch (error: any) {
    console.error('Error getting repayment details:', error);
    throw error;
  }
};

// Mock implementations for fallback
export const submitApplicationMock = async (
  _contract: ethers.Contract | null,
  role: Role,
  metadataURI: string,
  appHash: string
): Promise<any> => {
  console.log('MOCK: Submitting application with params:', { role, metadataURI, appHash });

  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };
};

export const approveApplicationMock = async (
  _contract: ethers.Contract | null,
  _eduNFTContract: ethers.Contract | null,
  applicant: string,
  loanAmount: string
): Promise<{ receipt: any; nftId: number }> => {
  console.log('MOCK: Approving application with params:', { applicant, loanAmount });

  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const receipt = {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };

  // Simulate minting an NFT
  console.log('MOCK: Minting education NFT for applicant:', applicant);
  const metadataURI = `ipfs://QmEducationNFT/${Date.now()}`;
  const nftId = await mintNFTMock(_eduNFTContract, applicant, metadataURI, loanAmount);
  console.log('MOCK: Education NFT minted with ID:', nftId);

  return { receipt, nftId };
};

export const repayLoanMock = async (
  _contract: ethers.Contract | null,
  nftId: number,
  amount: string
): Promise<any> => {
  console.log('MOCK: Repaying loan with params:', { nftId, amount });

  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    hash: '0x' + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000),
    blockHash: '0x' + Math.random().toString(16).substring(2, 66),
    timestamp: Date.now()
  };
};

export const getApplicationMock = async (
  _contract: ethers.Contract | null,
  applicant: string
): Promise<Application> => {
  return {
    applicant,
    role: Math.random() > 0.5 ? Role.STUDENT : Role.SCHOOL,
    metadataURI: 'ipfs://QmXyZ123456789',
    applicationHash: '0x' + Math.random().toString(16).substring(2, 66),
    verified: Math.random() > 0.3,
    approved: Math.random() > 0.6,
    nftId: Math.floor(Math.random() * 100)
  };
};

export const hasAppliedMock = async (
  _contract: ethers.Contract | null,
  _applicant: string
): Promise<boolean> => {
  return Math.random() > 0.5;
};

export const getApplicantNFTsMock = async (
  _contract: ethers.Contract | null,
  _applicant: string
): Promise<number[]> => {
  const numNFTs = Math.floor(Math.random() * 3);
  const nfts: number[] = [];

  for (let i = 0; i < numNFTs; i++) {
    nfts.push(Math.floor(Math.random() * 100));
  }

  return nfts;
};

export const getRepaymentDetailsMock = async (
  _contract: ethers.Contract | null,
  _nftId: number
): Promise<RepaymentDetails> => {
  const totalLoan = Math.floor(Math.random() * 10) * 1e18;
  const amountRepaid = Math.floor(Math.random() * totalLoan);

  return {
    totalLoan,
    amountRepaid,
    fullyRepaid: amountRepaid >= totalLoan
  };
};
