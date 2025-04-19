'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';

const Navbar = () => {
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-[#082865] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-white">EduFunding</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 border-transparent hover:border-[#0046D7]">
                Home
              </Link>
              <Link href="/school" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 border-transparent hover:border-[#0046D7]">
                School Registration
              </Link>
              <Link href="/student" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 border-transparent hover:border-[#0046D7]">
                Student Registration
              </Link>
              <Link href="/dao" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 border-transparent hover:border-[#0046D7]">
                DAO Voting
              </Link>
              <Link href="/profile" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 border-transparent hover:border-[#0046D7]">
                Profile
              </Link>
              <Link href="/donate" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 border-transparent hover:border-[#0046D7]">
                Donate
              </Link>
              <Link href="/nft" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 border-transparent hover:border-[#0046D7]">
                My NFTs
              </Link>
              <Link href="/token" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 border-transparent hover:border-[#0046D7]">
                Tokens
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0046D7] shadow-sm hover:bg-[#003FA3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0046D7]"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-white truncate max-w-[150px]">
                    {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#700046] shadow-sm hover:bg-[#500033] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#700046]"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 hover:bg-[#0046D7] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0046D7]"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#0046D7]`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/" className="block pl-3 pr-4 py-2 border-l-4 border-[#003FA3] text-base font-medium text-white bg-[#0055FF]">
            Home
          </Link>
          <Link href="/school" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:bg-[#0055FF] hover:border-[#003FA3]">
            School Registration
          </Link>
          <Link href="/student" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:bg-[#0055FF] hover:border-[#003FA3]">
            Student Registration
          </Link>
          <Link href="/dao" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:bg-[#0055FF] hover:border-[#003FA3]">
            DAO Voting
          </Link>
          <Link href="/profile" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:bg-[#0055FF] hover:border-[#003FA3]">
            Profile
          </Link>
          <Link href="/donate" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:bg-[#0055FF] hover:border-[#003FA3]">
            Donate
          </Link>
          <Link href="/nft" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:bg-[#0055FF] hover:border-[#003FA3]">
            My NFTs
          </Link>
          <Link href="/token" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:bg-[#0055FF] hover:border-[#003FA3]">
            Tokens
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
