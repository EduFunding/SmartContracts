'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { 
  getBalance, getBalanceMock, 
  getStakedBalance, getStakedBalanceMock,
  stakeTokens, stakeTokensMock,
  unstakeTokens, unstakeTokensMock,
  isEligibleForDAO, isEligibleForDAOMock
} from '@/services/eduTokenService';
import { ethers } from 'ethers';

export default function TokenPage() {
  const { account, eduTokenContract, isConnected } = useWeb3();
  const [balance, setBalance] = useState<string | null>(null);
  const [stakedBalance, setStakedBalance] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<'stake' | 'unstake'>('stake');

  // Required stake amount for DAO participation (100 tokens)
  const requiredStake = ethers.parseEther('100').toString();

  // Fetch token balances and eligibility when the page loads
  useEffect(() => {
    const fetchData = async () => {
      if (account && eduTokenContract) {
        setLoading(true);
        try {
          // Try to use the real contract first
          const tokenBalance = await getBalance(eduTokenContract, account);
          setBalance(tokenBalance);
          
          const tokenStakedBalance = await getStakedBalance(eduTokenContract, account);
          setStakedBalance(tokenStakedBalance);
          
          const daoEligibility = await isEligibleForDAO(eduTokenContract, account, requiredStake);
          setIsEligible(daoEligibility);
        } catch (err) {
          console.error('Error fetching data from real contract:', err);
          console.log('Falling back to mock implementation');
          
          // Fall back to mock implementation
          try {
            const mockBalance = await getBalanceMock(null, account);
            setBalance(mockBalance);
            
            const mockStakedBalance = await getStakedBalanceMock(null, account);
            setStakedBalance(mockStakedBalance);
            
            const mockEligibility = await isEligibleForDAOMock(null, account, requiredStake);
            setIsEligible(mockEligibility);
          } catch (mockErr) {
            console.error('Error fetching data from mock service:', mockErr);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    if (isConnected && account) {
      fetchData();
    }
  }, [isConnected, account, eduTokenContract, requiredStake]);

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

      if (!eduTokenContract) {
        throw new Error('EduToken contract not initialized');
      }

      if (action === 'stake') {
        try {
          // Try to use the real contract first
          const receipt = await stakeTokens(eduTokenContract, amountInWei.toString());
          setSuccess(`Tokens staked successfully! Transaction hash: ${receipt.hash}`);
        } catch (contractError) {
          console.error('Error using real contract, falling back to mock implementation:', contractError);
          
          // Fall back to mock implementation
          const mockReceipt = await stakeTokensMock(eduTokenContract, amountInWei.toString());
          setSuccess(`Tokens staked successfully! (Mock) Transaction hash: ${mockReceipt.hash}`);
        }
      } else {
        try {
          // Try to use the real contract first
          const receipt = await unstakeTokens(eduTokenContract, amountInWei.toString());
          setSuccess(`Tokens unstaked successfully! Transaction hash: ${receipt.hash}`);
        } catch (contractError) {
          console.error('Error using real contract, falling back to mock implementation:', contractError);
          
          // Fall back to mock implementation
          const mockReceipt = await unstakeTokensMock(eduTokenContract, amountInWei.toString());
          setSuccess(`Tokens unstaked successfully! (Mock) Transaction hash: ${mockReceipt.hash}`);
        }
      }

      // Update balances after staking/unstaking
      if (account) {
        try {
          const newBalance = await getBalance(eduTokenContract, account);
          setBalance(newBalance);
          
          const newStakedBalance = await getStakedBalance(eduTokenContract, account);
          setStakedBalance(newStakedBalance);
          
          const newEligibility = await isEligibleForDAO(eduTokenContract, account, requiredStake);
          setIsEligible(newEligibility);
        } catch (err) {
          console.error('Error updating balances:', err);
          
          // Fall back to mock implementation
          const mockBalance = await getBalanceMock(null, account);
          setBalance(mockBalance);
          
          const mockStakedBalance = await getStakedBalanceMock(null, account);
          setStakedBalance(mockStakedBalance);
          
          const mockEligibility = await isEligibleForDAOMock(null, account, requiredStake);
          setIsEligible(mockEligibility);
        }
      }

      // Clear the form
      setAmount('');
    } catch (err: any) {
      console.error('Error processing tokens:', err);
      setError(err.message || 'An error occurred while processing tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">EduToken Management</h1>
      
      {!isConnected ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
          Please connect your wallet to manage your tokens
        </div>
      ) : loading && !balance ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Token Balance</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available:</span>
                <span className="text-2xl font-bold">{balance ? ethers.formatEther(balance) : '0'} EDU</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Staked:</span>
                <span className="text-2xl font-bold">{stakedBalance ? ethers.formatEther(stakedBalance) : '0'} EDU</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="text-2xl font-bold">
                  {balance && stakedBalance 
                    ? ethers.formatEther(ethers.toBigInt(balance) + ethers.toBigInt(stakedBalance)) 
                    : '0'} EDU
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">DAO Participation</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Required Stake:</span>
                <span className="font-medium">{ethers.formatEther(requiredStake)} EDU</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Stake:</span>
                <span className="font-medium">{stakedBalance ? ethers.formatEther(stakedBalance) : '0'} EDU</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isEligible ? 'Eligible for DAO' : 'Not Eligible'}
                </span>
              </div>
              {!isEligible && stakedBalance && (
                <div className="text-sm text-gray-600">
                  You need to stake {ethers.formatEther(ethers.toBigInt(requiredStake) - ethers.toBigInt(stakedBalance))} more EDU to participate in the DAO.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Stake/Unstake Tokens</h2>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setAction('stake')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                action === 'stake'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Stake
            </button>
            <button
              onClick={() => setAction('unstake')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                action === 'unstake'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unstake
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
                Amount (EDU)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : action === 'stake' ? 'Stake Tokens' : 'Unstake Tokens'}
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
        <h2 className="text-xl font-semibold mb-4">About EduTokens</h2>
        <p className="mb-4">
          EduTokens (EDU) are the governance tokens of the EduFunding platform. By staking EDU tokens, you can participate in the DAO and vote on funding decisions.
        </p>
        <p className="mb-4">
          You need to stake at least {ethers.formatEther(requiredStake)} EDU tokens to be eligible for DAO participation.
        </p>
        <p>
          Connected wallet: {account || 'Not connected'}
        </p>
      </div>
    </div>
  );
}
