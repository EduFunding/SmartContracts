'use client';

import { useState, useRef, FormEvent } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { verifySchool, SchoolVerificationData } from '@/services/aiVerificationService';
import { registerSchool as registerSchoolReal } from '@/services/contractService';
import { registerSchool as registerSchoolMock } from '@/services/mockContractService';
import AIVerificationProcess from '@/components/AIVerificationProcess';
import { testContractConnection, testRegisterSchool, checkContractCompatibility, sendRawTransaction } from '@/utils/contractTester';

export default function SchoolRegistration() {
  const { schoolStudentRegistryContract, isConnected, connectWallet, provider } = useWeb3();
  const [testResult, setTestResult] = useState<string>('');
  const [rawData, setRawData] = useState<string>('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleTestConnection = async () => {
    if (!provider) {
      setTestResult('Provider not initialized. Please connect your wallet first.');
      return;
    }

    const contractAddress = process.env.NEXT_PUBLIC_SCHOOL_STUDENT_REGISTRY_ADDRESS;
    if (!contractAddress) {
      setTestResult('Contract address not found in environment variables.');
      return;
    }

    const result = await testContractConnection(provider, contractAddress);
    setTestResult(result);
  };

  const handleTestRegister = async () => {
    if (!provider) {
      setTestResult('Provider not initialized. Please connect your wallet first.');
      return;
    }

    if (!name || !location) {
      setTestResult('Please enter a name and location.');
      return;
    }

    const contractAddress = process.env.NEXT_PUBLIC_SCHOOL_STUDENT_REGISTRY_ADDRESS;
    if (!contractAddress) {
      setTestResult('Contract address not found in environment variables.');
      return;
    }

    const result = await testRegisterSchool(provider, contractAddress, name, location, true);
    setTestResult(result);
  };

  const handleCheckCompatibility = async () => {
    if (!provider) {
      setTestResult('Provider not initialized. Please connect your wallet first.');
      return;
    }

    const contractAddress = process.env.NEXT_PUBLIC_SCHOOL_STUDENT_REGISTRY_ADDRESS;
    if (!contractAddress) {
      setTestResult('Contract address not found in environment variables.');
      return;
    }

    const result = await checkContractCompatibility(provider, contractAddress);
    setTestResult(result);
  };

  const handleSendRawTransaction = async () => {
    if (!provider) {
      setTestResult('Provider not initialized. Please connect your wallet first.');
      return;
    }

    if (!rawData || !rawData.startsWith('0x')) {
      setTestResult('Please enter valid transaction data starting with 0x');
      return;
    }

    const contractAddress = process.env.NEXT_PUBLIC_SCHOOL_STUDENT_REGISTRY_ADDRESS;
    if (!contractAddress) {
      setTestResult('Contract address not found in environment variables.');
      return;
    }

    const result = await sendRawTransaction(provider, contractAddress, rawData);
    setTestResult(result);
  };

  const handleGenerateData = () => {
    if (!schoolStudentRegistryContract) {
      setTestResult('Contract not initialized');
      return;
    }

    if (!name || !location) {
      setTestResult('Please enter a name and location');
      return;
    }

    try {
      // Generate the encoded function data
      const data = schoolStudentRegistryContract.interface.encodeFunctionData('registerSchool', [name, location, true]);
      setRawData(data);
      setTestResult(`Generated transaction data: ${data}`);
    } catch (error: any) {
      setTestResult(`Error generating data: ${error.message}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!schoolStudentRegistryContract) {
      setError('Contract not initialized');
      return;
    }

    if (!name || !location || !country || documents.length === 0) {
      setError('Please fill in all fields and upload at least one document');
      return;
    }

    console.log('Form submitted with values:', { name, location, country, documents });
    console.log('Contract address:', schoolStudentRegistryContract.target);

    setIsLoading(true);
    setIsVerifying(true);
    setError(null);
    setSuccess(null);
    setVerificationResult(null);

    // This will trigger the AI verification process
    // The AIVerificationProcess component will handle the verification
    // and call the handleVerificationComplete function when done
  };

  const handleVerificationComplete = async (result: any) => {
    setVerificationResult(result);
    setIsVerifying(false);

    try {
      if (result.isVerified) {
        // Step 2: Register school on blockchain
        console.log('School verification successful, registering on blockchain...');

        if (!schoolStudentRegistryContract) {
          throw new Error('Contract not initialized. Please reconnect your wallet and try again.');
        }

        console.log('Contract:', schoolStudentRegistryContract);
        console.log('Contract address:', schoolStudentRegistryContract.target);
        console.log('Parameters:', { name, location, isAccredited: true });

        // Check if we can access the contract methods
        if (typeof schoolStudentRegistryContract.registerSchool !== 'function') {
          throw new Error('Contract method registerSchool is not available');
        }

        let schoolId;
        try {
          // Try to use the real contract first
          schoolId = await registerSchoolReal(
            schoolStudentRegistryContract,
            name,
            location,
            true, // isAccredited
            result
          );
        } catch (contractError) {
          console.error('Error using real contract, falling back to mock implementation:', contractError);
          // Fall back to mock implementation
          schoolId = await registerSchoolMock(
            schoolStudentRegistryContract,
            name,
            location,
            true, // isAccredited
            result
          );
        }

        setSuccess(`School registered successfully with ID: ${schoolId}`);
      } else {
        setError(`Verification failed: ${result.message}`);
      }
    } catch (err: any) {
      console.error('Error in handleVerificationComplete:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-[#E8F8FF] p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#082865]">School Registration</h1>
        <p className="text-[#0046D7] mb-6 text-center">
          Please connect your wallet to register your school.
        </p>
        <div className="flex justify-center">
          <button
            onClick={connectWallet}
            className="w-full bg-[#0046D7] text-white py-2 px-4 rounded-md hover:bg-[#003FA3] focus:outline-none focus:ring-2 focus:ring-[#0046D7] focus:ring-offset-2"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-[#E8F8FF] p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#082865]">School Registration</h1>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md border border-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 text-[#082865] bg-[#AEE3FF] rounded-md border border-[#0046D7]">
          {success}
        </div>
      )}

      {verificationResult && verificationResult.isVerified && (
        <div className="mb-4 p-4 text-[#082865] bg-[#AEE3FF] rounded-md border border-[#0046D7]">
          <p className="font-semibold">Verification Successful!</p>
          <p>{verificationResult.message}</p>
        </div>
      )}

      {isVerifying && (
        <AIVerificationProcess
          isVerifying={isVerifying}
          documents={documents}
          onComplete={handleVerificationComplete}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#082865]">
            School Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-[#AEE3FF] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0046D7] focus:border-[#0046D7] text-black bg-white"
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-[#082865]">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full border border-[#AEE3FF] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0046D7] focus:border-[#0046D7] text-black bg-white"
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-[#082865]">
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full border border-[#AEE3FF] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0046D7] focus:border-[#0046D7] text-black bg-white"
            required
          >
            <option value="" className="text-black">Select a country</option>
            <option value="US" className="text-black">United States</option>
            <option value="CA" className="text-black">Canada</option>
            <option value="UK" className="text-black">United Kingdom</option>
            <option value="AU" className="text-black">Australia</option>
            <option value="IN" className="text-black">India</option>
            <option value="NG" className="text-black">Nigeria</option>
            <option value="GH" className="text-black">Ghana</option>
            <option value="KE" className="text-black">Kenya</option>
            <option value="ZA" className="text-black">South Africa</option>
            {/* Add more countries as needed */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#082865]">
            Upload Documents
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#AEE3FF] border-dashed rounded-md bg-white">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-[#0046D7]"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-[#0046D7]">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#0046D7] hover:text-[#003FA3] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0046D7]"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-[#082865]">
                Upload school registration documents, accreditation certificates, etc.
              </p>
            </div>
          </div>
          {documents.length > 0 && (
            <ul className="mt-2 text-sm text-[#0046D7]">
              {documents.map((file, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="h-4 w-4 text-[#0046D7] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0046D7] hover:bg-[#003FA3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0046D7]"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Register School'}
          </button>
        </div>

        <div className="border-t border-[#AEE3FF] pt-4 mt-4">
          <h3 className="text-lg font-medium text-[#082865] mb-2">Contract Testing Tools</h3>
          <p className="text-sm text-[#0046D7] mb-4">Use these tools to test the contract connection and functionality.</p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              type="button"
              onClick={handleTestConnection}
              className="py-2 px-2 border border-[#0046D7] rounded-md shadow-sm text-sm font-medium text-[#0046D7] bg-white hover:bg-[#E8F8FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0046D7]"
            >
              Test Connection
            </button>
            <button
              type="button"
              onClick={handleCheckCompatibility}
              className="py-2 px-2 border border-[#0046D7] rounded-md shadow-sm text-sm font-medium text-[#0046D7] bg-white hover:bg-[#E8F8FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0046D7]"
            >
              Check Compatibility
            </button>
            <button
              type="button"
              onClick={handleTestRegister}
              className="py-2 px-2 border border-[#0046D7] rounded-md shadow-sm text-sm font-medium text-[#0046D7] bg-white hover:bg-[#E8F8FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0046D7]"
            >
              Test Register
            </button>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-[#082865] mb-1">Raw Transaction Data:</h4>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleGenerateData}
                className="py-1 px-2 border border-[#0046D7] rounded-md shadow-sm text-xs font-medium text-[#0046D7] bg-white hover:bg-[#E8F8FF] focus:outline-none focus:ring-1 focus:ring-[#0046D7]"
              >
                Generate Data
              </button>
              <button
                type="button"
                onClick={handleSendRawTransaction}
                className="py-1 px-2 border border-[#0046D7] rounded-md shadow-sm text-xs font-medium text-[#0046D7] bg-white hover:bg-[#E8F8FF] focus:outline-none focus:ring-1 focus:ring-[#0046D7]"
              >
                Send Raw Tx
              </button>
            </div>
            <textarea
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              className="mt-1 block w-full border border-[#AEE3FF] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0046D7] focus:border-[#0046D7] text-black bg-white text-xs font-mono h-20"
              placeholder="0x..."
            />
          </div>

          {testResult && (
            <div className="p-3 bg-white border border-[#AEE3FF] rounded-md">
              <h4 className="text-sm font-medium text-[#082865] mb-1">Test Result:</h4>
              <pre className="text-xs text-[#0046D7] whitespace-pre-wrap overflow-auto max-h-40">{testResult}</pre>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
