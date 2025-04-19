'use client';

import Image from "next/image";
import Link from "next/link";
import { useWeb3 } from "@/context/Web3Context";

export default function Home() {
  const { isConnected, connectWallet } = useWeb3();

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-[#082865] sm:text-4xl">
            Education Funding Platform
          </h2>
          <p className="mt-3 max-w-3xl text-lg text-[#0046D7]">
            A decentralized platform for funding educational initiatives using blockchain technology and AI verification.
          </p>
          <div className="mt-8 flex space-x-4">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#0046D7] hover:bg-[#003FA3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0046D7]"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/school"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#0046D7] hover:bg-[#003FA3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0046D7]"
                >
                  Register School
                </Link>
                <Link
                  href="/student"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#082865] bg-[#AEE3FF] hover:bg-[#7BD4FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0046D7]"
                >
                  Register Student
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 lg:mt-0">
          <div className="bg-[#E8F8FF] overflow-hidden shadow rounded-lg divide-y divide-[#AEE3FF]">
            <div className="px-4 py-5 sm:px-6 bg-[#0046D7]">
              <h3 className="text-lg leading-6 font-medium text-white">EduFunding Features</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-[#0046D7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-[#082865]">AI-powered verification for schools and students seeking funding</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-[#0046D7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-[#082865]">Blockchain-based funding distribution for transparency and accountability</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-[#0046D7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-[#082865]">DAO governance for community-driven funding decisions and approvals</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-[#0046D7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-[#082865]">NFT-based certificates for funded educational initiatives</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-2xl font-extrabold text-[#082865] sm:text-3xl">How It Works</h3>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-[#E8F8FF] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#0046D7] rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="ml-4 text-lg font-medium text-[#082865]">1. Document Submission</h4>
              </div>
              <div className="mt-4 text-base text-[#0046D7]">
                Schools and students upload their documents and funding proposals to the platform for verification.
              </div>
            </div>
          </div>

          <div className="bg-[#E8F8FF] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#0046D7] rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="ml-4 text-lg font-medium text-[#082865]">2. AI Verification</h4>
              </div>
              <div className="mt-4 text-base text-[#0046D7]">
                Our AI system verifies the documents and funding needs against official databases to ensure authenticity.
              </div>
            </div>
          </div>

          <div className="bg-[#E8F8FF] overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#0046D7] rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="ml-4 text-lg font-medium text-[#082865]">3. DAO Funding & Certification</h4>
              </div>
              <div className="mt-4 text-base text-[#0046D7]">
                Verified applications are sent to the DAO for funding approval, and successful applicants receive funds and NFT certificates.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
