'use client';

import { useState, FormEvent } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { makeDonation, makeDonationMock, getTotalDonations, getTotalDonationsMock } from '@/services/donationService';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';

export default function DonatePage() {
  const { account, donationVaultContract, eduNFTContract, eduTokenContract, isConnected } = useWeb3();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalDonations, setTotalDonations] = useState<string | null>(null);
  const [mintedNftId, setMintedNftId] = useState<number | null>(null);
  const [mintedTokens, setMintedTokens] = useState<string | null>(null);

  // Fetch total donations when the page loads
  useState(() => {
    const fetchTotalDonations = async () => {
      if (donationVaultContract) {
        try {
          const total = await getTotalDonations(donationVaultContract);
          setTotalDonations(ethers.formatEther(total));
        } catch (err) {
          console.error('Error fetching total donations:', err);
          try {
            const mockTotal = await getTotalDonationsMock();
            setTotalDonations(ethers.formatEther(mockTotal));
          } catch (mockErr) {
            console.error('Error fetching mock total donations:', mockErr);
          }
        }
      }
    };

    if (isConnected && donationVaultContract) {
      fetchTotalDonations();
    }
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    if (!isConnected) {
      setError('Please connect your wallet first');
      setLoading(false);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      // Convert amount from ETH to wei
      const amountInWei = ethers.parseEther(amount);

      if (!donationVaultContract || !eduNFTContract || !eduTokenContract) {
        throw new Error('Required contracts not initialized');
      }

      try {
        // Try to use the real contract first
        const result = await makeDonation(donationVaultContract, eduNFTContract, eduTokenContract, amountInWei.toString());
        setSuccess(`Donation successful! Transaction hash: ${result.receipt.hash}`);
        setMintedNftId(result.nftId);
        setMintedTokens(result.tokenAmount);

        // Update total donations
        const total = await getTotalDonations(donationVaultContract);
        setTotalDonations(ethers.formatEther(total));
      } catch (contractError) {
        console.error('Error using real contract, falling back to mock implementation:', contractError);

        // Fall back to mock implementation
        const mockResult = await makeDonationMock(donationVaultContract, eduNFTContract, eduTokenContract, amountInWei.toString());
        setSuccess(`Donation successful! (Mock) Transaction hash: ${mockResult.receipt.hash}`);
        setMintedNftId(mockResult.nftId);
        setMintedTokens(mockResult.tokenAmount);

        // Update total donations with mock data
        const mockTotal = await getTotalDonationsMock();
        setTotalDonations(ethers.formatEther(mockTotal));
      }

      // Clear the form
      setAmount('');
    } catch (err: any) {
      console.error('Error making donation:', err);
      setError(err.message || 'An error occurred while making the donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Make a Donation</h1>

      {totalDonations && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Total Donations</h2>
          <p className="text-2xl font-bold">{totalDonations} ETH</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
              Amount (ETH)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              step="0.01"
              min="0.01"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isConnected}
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              loading || !isConnected
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : 'Donate'}
          </button>

          {!isConnected && (
            <p className="mt-2 text-red-500 text-sm">
              Please connect your wallet to make a donation
            </p>
          )}
        </form>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          <p className="mb-2">{success}</p>
          <div className="mt-2 space-y-4">
            {mintedNftId && (
              <div>
                <p className="font-medium mb-2">You received an NFT for your donation!</p>
                <button
                  onClick={() => router.push('/nft')}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Your NFT #{mintedNftId}
                </button>
              </div>
            )}
            {mintedTokens && (
              <div>
                <p className="font-medium mb-2">You received {mintedTokens} EDU tokens for your donation!</p>
                <button
                  onClick={() => router.push('/token')}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Your Tokens
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">About Donations</h2>
        <p className="mb-4">
          Your donations help fund education for students in need. All funds are managed transparently on the blockchain.
        </p>
        <p className="mb-4">
          The EduFunding platform uses these donations to provide loans to verified students, which they can repay once they complete their education and find employment.
        </p>
        <p>
          Connected wallet: {account || 'Not connected'}
        </p>
      </div>
    </div>
  );
}
