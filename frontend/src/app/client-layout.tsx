'use client';

import React from 'react';
import { Web3Provider } from '@/context/Web3Context';
import Navbar from '@/components/Navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3Provider>
      <div className="flex flex-col min-h-screen bg-[#E8F8FF]">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          {children}
        </main>
        <footer className="bg-[#0046D7] shadow-md py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-white">
            <p>© {new Date().getFullYear()} Education Funding Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Web3Provider>
  );
}
