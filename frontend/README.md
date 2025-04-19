# Education Funding Platform Frontend

This is the frontend application for the Education Funding Platform, a decentralized platform for funding educational initiatives using blockchain technology and AI verification.

## Features

- School registration with AI verification
- Student registration with AI verification
- DAO voting for application approval
- Profile management
- NFT certification for verified credentials

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MetaMask or any other Ethereum wallet

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SCHOOL_STUDENT_REGISTRY_ADDRESS=0x516A5dd0bDCf2D711188Daa54f7156C84f89286C
NEXT_PUBLIC_EDU_FUNDING_ADDRESS=0x6c107341Eae178Ec54166a6655D2C61EA04b7dd4
NEXT_PUBLIC_DONATION_VAULT_ADDRESS=0x280235D9b223c4159377C9538Eae27C422b40125
NEXT_PUBLIC_EDU_TOKEN_ADDRESS=0xd670418F0C8ce030d05c81Ceb3CF6d2DdC6c425e
NEXT_PUBLIC_EDU_NFT_ADDRESS=0xb09F45DdC70Ac906dd2764316D726a99f8Df6E83
NEXT_PUBLIC_CHAIN_ID=33111
NEXT_PUBLIC_AI_VERIFICATION_API_URL=https://api.example.com/verify
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Connect your wallet using the "Connect Wallet" button in the navigation bar.
2. Register a school or student by navigating to the respective pages.
3. Upload documents for verification.
4. Wait for AI verification and DAO approval.
5. View your profile and certificates.

## AI Verification

The platform uses AI to verify the authenticity of documents uploaded by schools and students. The verification process checks:

- Document authenticity
- School accreditation
- Student enrollment
- Country-specific educational standards

## Smart Contract Integration

The frontend integrates with the following smart contracts:

- SchoolStudentRegistry: Manages school and student registrations
- EduFunding: Handles applications, verification, and NFT certification
- DonationVault: Manages funding for educational initiatives
- EduToken: ERC-20 token for DAO governance
- EduNFT: ERC-721 token for certification

## License

This project is licensed under the MIT License.
