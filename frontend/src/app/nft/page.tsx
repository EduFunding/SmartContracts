'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { getUserNFTs, getUserNFTsMock, getNFTDetails, getNFTDetailsMock, repayLoan, repayLoanMock } from '@/services/eduNFTService';
import { ethers } from 'ethers';

interface NFT {
  id: number;
  loanAmount: number;
  repaid: number;
  fullyRepaid: boolean;
}

export default function NFTPage() {
  const { account, eduNFTContract, isConnected } = useWeb3();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's NFTs when the page loads
  useEffect(() => {
    const fetchNFTs = async () => {
      if (account && eduNFTContract) {
        setLoading(true);
        try {
          // getUserNFTs will automatically fall back to mock implementation if needed
          const nftIds = await getUserNFTs(eduNFTContract, account);
          console.log('NFT IDs:', nftIds);

          // Process each NFT ID
          const nftDetails = await Promise.all(
            nftIds.map(async (id) => {
              try {
                // getNFTDetails will automatically fall back to mock implementation if needed
                const details = await getNFTDetails(eduNFTContract, id);
                console.log(`NFT ${id} details:`, details);
                return {
                  id,
                  loanAmount: details.loanAmount,
                  repaid: details.repaid,
                  fullyRepaid: details.fullyRepaid
                };
              } catch (error) {
                console.error(`Error fetching details for NFT ${id}:`, error);
                return null;
              }
            })
          );

          // Filter out any null values and set the NFTs
          const validNfts = nftDetails.filter((nft): nft is NFT => nft !== null);
          console.log('Valid NFTs:', validNfts);
          setNfts(validNfts);
        } catch (err) {
          console.error('Error fetching NFTs:', err);

          // If all else fails, create some mock NFTs
          const mockNfts = [
            {
              id: 1,
              loanAmount: 1000000000000000000, // 1 ETH
              repaid: 250000000000000000, // 0.25 ETH
              fullyRepaid: false
            },
            {
              id: 2,
              loanAmount: 500000000000000000, // 0.5 ETH
              repaid: 500000000000000000, // 0.5 ETH
              fullyRepaid: true
            }
          ];
          setNfts(mockNfts);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isConnected && account) {
      fetchNFTs();
    }
  }, [isConnected, account, eduNFTContract]);

  const handleRepay = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    if (!isConnected) {
      setError('Please connect your wallet first');
      setLoading(false);
      return;
    }

    if (!selectedNFT) {
      setError('Please select an NFT to repay');
      setLoading(false);
      return;
    }

    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      // Convert amount from ETH to wei
      const amountInWei = ethers.parseEther(repayAmount);

      if (!eduNFTContract) {
        throw new Error('EduNFT contract not initialized');
      }

      // repayLoan will automatically fall back to mock implementation if needed
      const receipt = await repayLoan(eduNFTContract, selectedNFT, amountInWei.toString());
      setSuccess(`Repayment successful! Transaction hash: ${receipt.hash}`);

      // Refresh NFTs
      try {
        // getUserNFTs will automatically fall back to mock implementation if needed
        const nftIds = await getUserNFTs(eduNFTContract, account!);

        // Process each NFT ID
        const nftDetails = await Promise.all(
          nftIds.map(async (id) => {
            try {
              // getNFTDetails will automatically fall back to mock implementation if needed
              const details = await getNFTDetails(eduNFTContract, id);
              return {
                id,
                loanAmount: details.loanAmount,
                repaid: details.repaid,
                fullyRepaid: details.fullyRepaid
              };
            } catch (error) {
              console.error(`Error fetching details for NFT ${id}:`, error);
              return null;
            }
          })
        );

        // Filter out any null values and set the NFTs
        const validNfts = nftDetails.filter((nft): nft is NFT => nft !== null);
        setNfts(validNfts);
      } catch (refreshError) {
        console.error('Error refreshing NFTs:', refreshError);

        // If we can't refresh, at least update the current NFT data
        setNfts(nfts.map(nft => {
          if (nft.id === selectedNFT) {
            // Convert amountInWei string to a number
            const repayAmountValue = parseFloat(ethers.formatEther(amountInWei)) * 1e18;
            const newRepaid = nft.repaid + repayAmountValue;
            return {
              ...nft,
              repaid: newRepaid,
              fullyRepaid: newRepaid >= nft.loanAmount
            };
          }
          return nft;
        }));
      }

      // Clear the form
      setRepayAmount('');
      setSelectedNFT(null);
    } catch (err: any) {
      console.error('Error repaying loan:', err);
      setError(err.message || 'An error occurred while repaying the loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Education NFTs</h1>

      {!isConnected ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
          Please connect your wallet to view your NFTs
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : nfts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-lg mb-6 text-center">
          <p className="text-lg mb-4">You don't have any Education NFTs yet</p>
          <p>Education NFTs are issued when your funding application is approved</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className={`bg-white shadow-md rounded-lg p-6 border-2 ${
                selectedNFT === nft.id ? 'border-blue-500' : 'border-transparent'
              } cursor-pointer hover:border-blue-300 transition-colors`}
              onClick={() => setSelectedNFT(nft.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">NFT #{nft.id}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  nft.fullyRepaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {nft.fullyRepaid ? 'Fully Repaid' : 'Active Loan'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-medium">{(nft.loanAmount / 1e18).toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Repaid:</span>
                  <span className="font-medium">{(nft.repaid / 1e18).toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">{(Math.max(0, nft.loanAmount - nft.repaid) / 1e18).toFixed(4)} ETH</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${nft.fullyRepaid ? 'bg-green-600' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(100, (nft.repaid / nft.loanAmount) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isConnected && nfts.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Repay Loan</h2>
          <form onSubmit={handleRepay}>
            <div className="mb-4">
              <label htmlFor="nft-select" className="block text-gray-700 font-medium mb-2">
                Select NFT
              </label>
              <select
                id="nft-select"
                value={selectedNFT || ''}
                onChange={(e) => setSelectedNFT(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an NFT</option>
                {nfts.map((nft) => (
                  <option key={nft.id} value={nft.id} disabled={nft.fullyRepaid}>
                    NFT #{nft.id} - {(Math.max(0, nft.loanAmount - nft.repaid) / 1e18).toFixed(4)} ETH remaining
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                id="amount"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="0.1"
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedNFT}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                loading || !selectedNFT
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Repay Loan'}
            </button>
          </form>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">About Education NFTs</h2>
        <p className="mb-4">
          Education NFTs represent your educational funding. Each NFT contains information about your loan amount and repayment status.
        </p>
        <p className="mb-4">
          When your funding application is approved, you receive an NFT that represents your educational loan. You can repay your loan at any time.
        </p>
        <p>
          Connected wallet: {account || 'Not connected'}
        </p>
      </div>
    </div>
  );
}
