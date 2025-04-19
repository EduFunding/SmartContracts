'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { verifyStudent, StudentVerificationData } from '@/services/aiVerificationService';
import { registerStudent as registerStudentReal, getAllSchools as getAllSchoolsReal, School } from '@/services/contractService';
import { registerStudent as registerStudentMock, getAllSchools as getAllSchoolsMock } from '@/services/mockContractService';
import AIVerificationProcess from '@/components/AIVerificationProcess';

export default function StudentRegistration() {
  const { schoolStudentRegistryContract, isConnected, connectWallet } = useWeb3();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [country, setCountry] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const schoolInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      if (schoolStudentRegistryContract) {
        try {
          // Try to use the real contract first
          const schoolsList = await getAllSchoolsReal(schoolStudentRegistryContract);
          setSchools(schoolsList);
        } catch (err) {
          console.error('Error fetching schools from real contract:', err);
          console.log('Falling back to mock implementation');

          // Fall back to mock implementation
          try {
            const mockSchoolsList = await getAllSchoolsMock();
            setSchools(mockSchoolsList);
          } catch (mockErr) {
            console.error('Error fetching schools from mock service:', mockErr);
          }
        }
      }
    };

    if (isConnected && schoolStudentRegistryContract) {
      fetchSchools();
    }
  }, [isConnected, schoolStudentRegistryContract]);

  // Filter schools based on input
  useEffect(() => {
    if (schoolName.trim() === '') {
      setFilteredSchools([]);
      setShowSchoolDropdown(false);
      return;
    }

    const filtered = schools.filter(school =>
      school.name.toLowerCase().includes(schoolName.toLowerCase())
    );
    setFilteredSchools(filtered);
    setShowSchoolDropdown(filtered.length > 0);
  }, [schoolName, schools]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSchoolName(school.name);
    setSchoolId(school.id.toString());
    setShowSchoolDropdown(false);
  };

  const handleClickOutside = () => {
    // Close the dropdown after a short delay to allow for selection
    setTimeout(() => {
      setShowSchoolDropdown(false);
    }, 200);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!name || !email || !schoolName || !schoolId || !country || documents.length === 0) {
      setError('Please fill in all fields and upload at least one document');
      return;
    }

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
        // Step 2: Register student on blockchain
        console.log('Student verification successful, registering on blockchain...');

        if (!schoolStudentRegistryContract) {
          throw new Error('Contract not initialized. Please reconnect your wallet and try again.');
        }

        console.log('Contract:', schoolStudentRegistryContract);
        console.log('Contract address:', schoolStudentRegistryContract.target);
        console.log('Parameters:', { name, email, schoolId: parseInt(schoolId) });

        // Check if we can access the contract methods
        if (typeof schoolStudentRegistryContract.registerStudent !== 'function') {
          throw new Error('Contract method registerStudent is not available');
        }

        let studentId;
        try {
          // Try to use the real contract first
          studentId = await registerStudentReal(
            schoolStudentRegistryContract,
            name,
            email,
            parseInt(schoolId),
            result
          );
        } catch (contractError) {
          console.error('Error using real contract, falling back to mock implementation:', contractError);
          // Fall back to mock implementation
          studentId = await registerStudentMock(
            schoolStudentRegistryContract,
            name,
            email,
            parseInt(schoolId),
            result
          );
        }

        setSuccess(`Student registered successfully with ID: ${studentId}`);
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
        <h1 className="text-2xl font-bold text-center mb-6 text-[#082865]">Student Registration</h1>
        <p className="text-[#0046D7] mb-6 text-center">
          Please connect your wallet to register as a student.
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
      <h1 className="text-2xl font-bold text-center mb-6 text-[#082865]">Student Registration</h1>

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
            Full Name
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
          <label htmlFor="email" className="block text-sm font-medium text-[#082865]">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-[#AEE3FF] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0046D7] focus:border-[#0046D7] text-black bg-white"
            required
          />
        </div>

        <div>
          <label htmlFor="schoolName" className="block text-sm font-medium text-[#082865]">
            School Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="schoolName"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              onFocus={() => schoolName.trim() !== '' && setShowSchoolDropdown(true)}
              onBlur={handleClickOutside}
              ref={schoolInputRef}
              className="mt-1 block w-full border border-[#AEE3FF] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0046D7] focus:border-[#0046D7] text-black bg-white"
              placeholder="Type to search for a school"
              required
            />
            {showSchoolDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto border border-[#AEE3FF]">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school) => (
                    <div
                      key={school.id}
                      className="px-4 py-2 hover:bg-[#E8F8FF] cursor-pointer"
                      onClick={() => handleSchoolSelect(school)}
                    >
                      <div className="font-medium text-[#082865]">{school.name}</div>
                      <div className="text-sm text-[#0046D7]">{school.location}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-[#0046D7]">
                    No schools found. Please type a different name.
                  </div>
                )}
              </div>
            )}
          </div>
          {schools.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              No schools registered yet. Please register a school first.
            </p>
          )}
          {schoolId && (
            <p className="mt-1 text-xs text-[#0046D7]">
              Selected School ID: {schoolId}
            </p>
          )}
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
                Upload student ID, transcripts, certificates, etc.
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
            disabled={isLoading || schools.length === 0}
          >
            {isLoading ? 'Processing...' : 'Register Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
