'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { getApplication, approveApplication } from '@/services/contractService';

interface ApplicationItem {
  applicant: string;
  role: number;
  metadataURI: string;
  applicationHash: string;
  verified: boolean;
  approved: boolean;
  nftId: number;
}

export default function DAOVoting() {
  const { eduFundingContract, isConnected, connectWallet, account } = useWeb3();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loanAmount, setLoanAmount] = useState<{ [key: string]: string }>({});

  // Mock applications for demo purposes
  // In a real implementation, these would be fetched from the blockchain
  useEffect(() => {
    if (isConnected && eduFundingContract) {
      // This is a mock implementation
      // In a real app, you would fetch applications from the contract
      const mockApplications: ApplicationItem[] = [
        {
          applicant: '0x1234567890123456789012345678901234567890',
          role: 0, // Student
          metadataURI: 'ipfs://QmXyZ123456789',
          applicationHash: '0xabcdef1234567890',
          verified: true,
          approved: false,
          nftId: 0
        },
        {
          applicant: '0x0987654321098765432109876543210987654321',
          role: 1, // School
          metadataURI: 'ipfs://QmAbc987654321',
          applicationHash: '0x123456789abcdef',
          verified: true,
          approved: false,
          nftId: 0
        }
      ];
      
      setApplications(mockApplications);
    }
  }, [isConnected, eduFundingContract]);

  const handleApprove = async (applicant: string) => {
    if (!eduFundingContract) {
      setError('Contract not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const amount = loanAmount[applicant] ? parseInt(loanAmount[applicant]) : 0;
      await approveApplication(eduFundingContract, applicant, amount);
      
      // Update the applications list
      setApplications(applications.map(app => 
        app.applicant === applicant ? { ...app, approved: true } : app
      ));
      
      setSuccess(`Application for ${applicant} approved successfully`);
    } catch (err: any) {
      setError(`Error approving application: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoanAmountChange = (applicant: string, value: string) => {
    setLoanAmount({
      ...loanAmount,
      [applicant]: value
    });
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">DAO Voting</h1>
        <p className="text-gray-600 mb-6 text-center">
          Please connect your wallet to participate in DAO voting.
        </p>
        <div className="flex justify-center">
          <button
            onClick={connectWallet}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">DAO Voting</h1>
      
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">
          {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Pending Applications
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Review and vote on verified applications.
          </p>
        </div>
        
        {applications.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            No pending applications to review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Amount (ETH)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.applicant}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.applicant.substring(0, 6)}...{application.applicant.substring(application.applicant.length - 4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.role === 0 ? 'Student' : 'School'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.approved ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.role === 0 && !application.approved ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={loanAmount[application.applicant] || ''}
                          onChange={(e) => handleLoanAmountChange(application.applicant, e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="0.00"
                        />
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!application.approved ? (
                        <button
                          onClick={() => handleApprove(application.applicant)}
                          className="text-indigo-600 hover:text-indigo-900"
                          disabled={isLoading}
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-gray-400">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
