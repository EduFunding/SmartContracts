'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { getApplication } from '@/services/contractService';

interface Application {
  applicant: string;
  role: number;
  metadataURI: string;
  applicationHash: string;
  verified: boolean;
  approved: boolean;
  nftId: number;
}

interface FundingDetails {
  amount: string;
  date: string;
  status: string;
  fundingId: number;
  purpose: string;
  expectedCompletionDate: string;
  milestones: {
    title: string;
    completed: boolean;
    dueDate: string;
  }[];
}

export default function Profile() {
  const { account, eduFundingContract, isConnected, connectWallet } = useWeb3();
  const [application, setApplication] = useState<Application | null>(null);
  const [fundingDetails, setFundingDetails] = useState<FundingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (isConnected && account && eduFundingContract) {
        setIsLoading(true);
        setError(null);

        try {
          const app = await getApplication(eduFundingContract, account);
          setApplication(app);

          // If application is approved, fetch funding details
          if (app.approved && app.nftId > 0) {
            // In a real implementation, this would fetch from the blockchain
            // For now, we'll use mock data
            const mockFundingDetails: FundingDetails = {
              amount: '5000',
              date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
              status: 'Active',
              fundingId: app.nftId,
              purpose: app.role === 0 ? 'Educational Scholarship' : 'School Infrastructure Development',
              expectedCompletionDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // One year from now
              milestones: [
                {
                  title: 'Initial Funding Release',
                  completed: true,
                  dueDate: new Date().toISOString().split('T')[0]
                },
                {
                  title: 'Progress Report Submission',
                  completed: false,
                  dueDate: new Date(Date.now() + 7776000000).toISOString().split('T')[0] // 90 days from now
                },
                {
                  title: 'Final Evaluation',
                  completed: false,
                  dueDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0] // One year from now
                }
              ]
            };

            setFundingDetails(mockFundingDetails);
          }
        } catch (err: any) {
          // If the error is because the user hasn't applied yet, don't show an error
          if (!err.message.includes('revert') && !err.message.includes('invalid address')) {
            setError(`Error fetching application: ${err.message}`);
          }
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchApplication();
  }, [isConnected, account, eduFundingContract]);

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Your Profile</h1>
        <p className="text-gray-600 mb-6 text-center">
          Please connect your wallet to view your profile.
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
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Account Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your blockchain identity and application details.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {account}
              </dd>
            </div>

            {isLoading ? (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Application Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Loading...
                </dd>
              </div>
            ) : application ? (
              <>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.role === 0 ? 'Student' : 'School'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.verified ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Not Verified
                      </span>
                    )}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Approval Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.approved ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    )}
                  </dd>
                </div>
                {application.approved && application.nftId > 0 && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">NFT Certificate ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {application.nftId}
                    </dd>
                  </div>
                )}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Metadata URI</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.metadataURI}
                  </dd>
                </div>
              </>
            ) : (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Application Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  No application found. Please register as a school or student.
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Display funding details if the application is approved */}
      {application && application.approved && fundingDetails && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Your Funding Details</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-indigo-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Funding Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Details about your approved funding.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Funding Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fundingDetails.amount} ETH
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Funding Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fundingDetails.date}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {fundingDetails.status}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Funding ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fundingDetails.fundingId}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fundingDetails.purpose}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Expected Completion</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fundingDetails.expectedCompletionDate}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Display milestones if the application is approved */}
      {application && application.approved && fundingDetails && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Project Milestones</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Progress Tracking
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Track your project milestones and deadlines.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {fundingDetails.milestones.map((milestone, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-6 w-6 rounded-full ${milestone.completed ? 'bg-green-100' : 'bg-yellow-100'} flex items-center justify-center`}>
                          {milestone.completed ? (
                            <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                          <p className="text-sm text-gray-500">Due: {milestone.dueDate}</p>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${milestone.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {milestone.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Display NFT certificates if the user has any */}
      {application && application.approved && application.nftId > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Your Certificates</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="border border-gray-200 rounded-lg p-4 w-64">
                <div className="bg-indigo-100 h-40 flex items-center justify-center rounded-md mb-4">
                  <svg className="h-16 w-16 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {application.role === 0 ? 'Student Certificate' : 'School Certificate'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">NFT ID: {application.nftId}</p>
                  <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    View Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
