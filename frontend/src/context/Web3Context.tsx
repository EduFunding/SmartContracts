'use client';

declare global {
  interface Window {
    ethereum: any;
  }
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import SchoolStudentRegistryABI from '@/constants/abis/SchoolStudentRegistry.json';
import EduFundingABI from '@/constants/abis/EduFunding.json';
import DonationVaultABI from '@/constants/abis/DonationVault.json';
import EduNFTABI from '@/constants/abis/EduNFT.json';
import EduTokenABI from '@/constants/abis/EduToken.json';

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  schoolStudentRegistryContract: ethers.Contract | null;
  eduFundingContract: ethers.Contract | null;
  donationVaultContract: ethers.Contract | null;
  eduNFTContract: ethers.Contract | null;
  eduTokenContract: ethers.Contract | null;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  chainId: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  schoolStudentRegistryContract: null,
  eduFundingContract: null,
  donationVaultContract: null,
  eduNFTContract: null,
  eduTokenContract: null,
  isConnected: false,
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [schoolStudentRegistryContract, setSchoolStudentRegistryContract] = useState<ethers.Contract | null>(null);
  const [eduFundingContract, setEduFundingContract] = useState<ethers.Contract | null>(null);
  const [donationVaultContract, setDonationVaultContract] = useState<ethers.Contract | null>(null);
  const [eduNFTContract, setEduNFTContract] = useState<ethers.Contract | null>(null);
  const [eduTokenContract, setEduTokenContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);

        // Create ethers provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        // Get signer
        const signer = await provider.getSigner();
        setSigner(signer);

        // Get chain ID
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));

        // Initialize contracts with the correct addresses from the deployed contracts
        const schoolStudentRegistryAddress = '0x516A5dd0bDCf2D711188Daa54f7156C84f89286C';
        const eduFundingAddress = '0x6c107341Eae178Ec54166a6655D2C61EA04b7dd4';
        const eduNFTAddress = '0xb09F45DdC70Ac906dd2764316D726a99f8Df6E83';
        const eduTokenAddress = '0xd670418F0C8ce030d05c81Ceb3CF6d2DdC6c425e';
        const donationVaultAddress = '0x280235D9b223c4159377C9538Eae27C422b40125';

        console.log('Initializing contracts with addresses:', {
          schoolStudentRegistryAddress,
          eduFundingAddress,
          eduNFTAddress,
          eduTokenAddress,
          donationVaultAddress
        });

        try {
          console.log('Initializing contracts with the provided addresses');
          console.warn('Note: If contract calls fail, the application will use mock implementations');

          // Get the signer address for logging purposes
          const signerAddress = await signer.getAddress();
          console.log('Connected wallet address:', signerAddress);

          // Initialize the SchoolStudentRegistry contract
          const schoolStudentRegistry = new ethers.Contract(
            schoolStudentRegistryAddress,
            SchoolStudentRegistryABI,
            signer
          );
          console.log('SchoolStudentRegistry contract initialized:', schoolStudentRegistry.target);

          // Set the contract in state
          console.log('SchoolStudentRegistry contract initialized with address:', schoolStudentRegistryAddress);

          setSchoolStudentRegistryContract(schoolStudentRegistry);

          // Initialize EduFunding contract
          const eduFunding = new ethers.Contract(
            eduFundingAddress,
            EduFundingABI,
            signer
          );
          console.log('EduFunding contract initialized:', eduFunding.target);
          setEduFundingContract(eduFunding);

          // Initialize DonationVault contract
          const donationVault = new ethers.Contract(
            donationVaultAddress,
            DonationVaultABI,
            signer
          );
          console.log('DonationVault contract initialized:', donationVault.target);
          setDonationVaultContract(donationVault);

          // Initialize EduNFT contract
          const eduNFT = new ethers.Contract(
            eduNFTAddress,
            EduNFTABI,
            signer
          );
          console.log('EduNFT contract initialized:', eduNFT.target);
          setEduNFTContract(eduNFT);

          // Initialize EduToken contract
          const eduToken = new ethers.Contract(
            eduTokenAddress,
            EduTokenABI,
            signer
          );
          console.log('EduToken contract initialized:', eduToken.target);
          setEduTokenContract(eduToken);
        } catch (error) {
          console.error('Error initializing contracts:', error);
        }

        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      console.error('Ethereum object not found, install MetaMask.');
      alert('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setSchoolStudentRegistryContract(null);
    setEduFundingContract(null);
    setDonationVaultContract(null);
    setEduNFTContract(null);
    setEduTokenContract(null);
    setIsConnected(false);
  };

  // Handle account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User has disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== account) {
          // User has switched accounts
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        connectWallet,
        disconnectWallet,
        schoolStudentRegistryContract,
        eduFundingContract,
        donationVaultContract,
        eduNFTContract,
        eduTokenContract,
        isConnected,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
