import { ethers } from 'ethers';
import SchoolStudentRegistryABI from '@/constants/abis/SchoolStudentRegistry.json';

export const sendRawTransaction = async (
  provider: ethers.BrowserProvider,
  contractAddress: string,
  data: string
): Promise<string> => {
  try {
    console.log('Sending raw transaction to:', contractAddress);
    console.log('Transaction data:', data);

    // Get signer
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log('Signer address:', signerAddress);

    // Send transaction
    const tx = await signer.sendTransaction({
      to: contractAddress,
      data: data,
      gasLimit: 500000
    });

    console.log('Transaction sent:', tx.hash);

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    if (receipt.status === 0) {
      return 'Transaction failed';
    }

    return `Transaction successful. Hash: ${tx.hash}`;
  } catch (error: any) {
    console.error('Error sending raw transaction:', error);
    return `Error sending raw transaction: ${error.message}`;
  }
};

export const checkContractCompatibility = async (
  provider: ethers.BrowserProvider,
  contractAddress: string
): Promise<string> => {
  try {
    console.log('Checking contract compatibility at:', contractAddress);

    // Get signer
    const signer = await provider.getSigner();
    console.log('Signer address:', await signer.getAddress());

    // Check if the contract exists at the address
    const code = await provider.getCode(contractAddress);
    console.log('Contract code length:', code.length);
    if (code === '0x') {
      return `No contract deployed at address ${contractAddress}`;
    }

    // Create contract instance
    const contract = new ethers.Contract(
      contractAddress,
      SchoolStudentRegistryABI,
      signer
    );

    // Check for expected functions
    const expectedFunctions = [
      'registerSchool',
      'registerStudent',
      'totalSchools',
      'totalStudents',
      'owner'
    ];

    const results = [];

    for (const funcName of expectedFunctions) {
      if (typeof contract[funcName] === 'function') {
        results.push(`✅ ${funcName}: Available`);
      } else {
        results.push(`❌ ${funcName}: Not available`);
      }
    }

    // Try to call some view functions
    try {
      const owner = await contract.owner();
      results.push(`✅ owner() returns: ${owner}`);
    } catch (error: any) {
      results.push(`❌ owner() call failed: ${error.message}`);
    }

    try {
      const totalSchools = await contract.totalSchools();
      results.push(`✅ totalSchools() returns: ${totalSchools}`);
    } catch (error: any) {
      results.push(`❌ totalSchools() call failed: ${error.message}`);
    }

    return results.join('\n');
  } catch (error: any) {
    console.error('Error checking contract compatibility:', error);
    return `Error checking contract compatibility: ${error.message}`;
  }
};

export const testContractConnection = async (
  provider: ethers.BrowserProvider,
  contractAddress: string
): Promise<string> => {
  try {
    console.log('Testing contract connection to:', contractAddress);

    // Get signer
    const signer = await provider.getSigner();
    console.log('Signer address:', await signer.getAddress());

    // Check if the contract exists at the address
    const code = await provider.getCode(contractAddress);
    console.log('Contract code length:', code.length);
    if (code === '0x') {
      return `No contract deployed at address ${contractAddress}`;
    }

    // Create contract instance
    const contract = new ethers.Contract(
      contractAddress,
      SchoolStudentRegistryABI,
      signer
    );

    console.log('Contract instance created');

    // Try to call a view function
    try {
      const totalSchools = await contract.totalSchools();
      console.log('Total schools:', totalSchools);
      return `Contract connection successful. Total schools: ${totalSchools}`;
    } catch (error: any) {
      console.error('Error calling view function:', error);

      // Try to call owner function as a fallback
      try {
        const owner = await contract.owner();
        console.log('Contract owner:', owner);
        return `Contract connection successful. Owner: ${owner}`;
      } catch (ownerError: any) {
        console.error('Error calling owner function:', ownerError);
        return `Error calling contract functions. The contract may not be compatible with the ABI.`;
      }
    }
  } catch (error: any) {
    console.error('Error testing contract connection:', error);
    return `Error testing contract connection: ${error.message}`;
  }
};

export const testRegisterSchool = async (
  provider: ethers.BrowserProvider,
  contractAddress: string,
  name: string,
  location: string,
  isAccredited: boolean
): Promise<string> => {
  try {
    console.log('Testing registerSchool with params:', { name, location, isAccredited });

    // Get signer
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log('Signer address:', signerAddress);

    // Check if the contract exists at the address
    const code = await provider.getCode(contractAddress);
    console.log('Contract code length:', code.length);
    if (code === '0x') {
      return `No contract deployed at address ${contractAddress}`;
    }

    // Create contract instance
    const contract = new ethers.Contract(
      contractAddress,
      SchoolStudentRegistryABI,
      signer
    );

    console.log('Contract instance created');

    // Check if the contract has the expected functions
    if (typeof contract.registerSchool !== 'function') {
      return 'Contract does not have registerSchool function';
    }

    // Try to get the owner of the contract
    try {
      const owner = await contract.owner();
      console.log('Contract owner:', owner);
      console.log('Is signer the owner?', owner.toLowerCase() === signerAddress.toLowerCase());

      if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        return `Warning: You are not the owner of the contract. Owner is ${owner}`;
      }
    } catch (error) {
      console.error('Error checking owner:', error);
    }

    // Encode function data
    const data = contract.interface.encodeFunctionData('registerSchool', [name, location, isAccredited]);
    console.log('Encoded function data:', data);

    // Try a direct transaction without static call
    try {
      // First approach: Use low-level call
      console.log('Trying direct transaction...');
      const tx = await signer.sendTransaction({
        to: contractAddress,
        data: data,
        gasLimit: 500000
      });

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      if (receipt.status === 0) {
        return 'Transaction failed';
      }

      return `School registered successfully. Transaction hash: ${tx.hash}`;
    } catch (error: any) {
      console.error('Error sending direct transaction:', error);

      // Second approach: Try with contract method
      try {
        console.log('Trying contract method...');
        const tx = await contract.registerSchool(name, location, isAccredited, {
          gasLimit: 500000
        });

        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        if (receipt.status === 0) {
          return 'Transaction failed';
        }

        return `School registered successfully. Transaction hash: ${tx.hash}`;
      } catch (contractError: any) {
        console.error('Error using contract method:', contractError);
        return `Both transaction methods failed. Error: ${error.message}\nContract method error: ${contractError.message}`;
      }
    }
  } catch (error: any) {
    console.error('Error testing registerSchool:', error);
    return `Error testing registerSchool: ${error.message}`;
  }
};
