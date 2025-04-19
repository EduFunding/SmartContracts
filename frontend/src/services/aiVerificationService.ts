import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_AI_VERIFICATION_API_URL;

export interface VerificationResult {
  isVerified: boolean;
  message: string;
  score?: number;
  details?: any;
}

export interface SchoolVerificationData {
  name: string;
  location: string;
  documents: File[];
  country: string;
}

export interface StudentVerificationData {
  name: string;
  email: string;
  schoolId: number;
  documents: File[];
  country: string;
}

export const verifySchool = async (data: SchoolVerificationData): Promise<VerificationResult> => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('location', data.location);
    formData.append('country', data.country);
    
    // Append all documents
    data.documents.forEach((doc, index) => {
      formData.append(`document_${index}`, doc);
    });

    // In a real implementation, this would call the AI verification API
    // For now, we'll simulate the API response
    
    // Uncomment this when you have a real API endpoint
    // const response = await axios.post(`${API_URL}/verify/school`, formData);
    // return response.data;

    // Simulated response
    return simulateVerification(data.name);
  } catch (error) {
    console.error('Error verifying school:', error);
    return {
      isVerified: false,
      message: 'Verification failed due to an error. Please try again.',
    };
  }
};

export const verifyStudent = async (data: StudentVerificationData): Promise<VerificationResult> => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('schoolId', data.schoolId.toString());
    formData.append('country', data.country);
    
    // Append all documents
    data.documents.forEach((doc, index) => {
      formData.append(`document_${index}`, doc);
    });

    // In a real implementation, this would call the AI verification API
    // For now, we'll simulate the API response
    
    // Uncomment this when you have a real API endpoint
    // const response = await axios.post(`${API_URL}/verify/student`, formData);
    // return response.data;

    // Simulated response
    return simulateVerification(data.name);
  } catch (error) {
    console.error('Error verifying student:', error);
    return {
      isVerified: false,
      message: 'Verification failed due to an error. Please try again.',
    };
  }
};

// Helper function to simulate verification (for demo purposes)
const simulateVerification = (name: string): VerificationResult => {
  // Simulate some basic verification logic
  const isValid = name.length > 3 && !name.includes('fake');
  
  if (isValid) {
    return {
      isVerified: true,
      message: 'Congratulations! Your application is being reviewed and has been sent to the DAO for voting.',
      score: 0.95,
      details: {
        verificationTime: new Date().toISOString(),
        verificationMethod: 'document analysis',
      }
    };
  } else {
    return {
      isVerified: false,
      message: 'Verification failed. The provided information appears to be invalid or incomplete.',
      score: 0.3,
      details: {
        verificationTime: new Date().toISOString(),
        verificationMethod: 'document analysis',
        reason: 'Invalid or insufficient information provided',
      }
    };
  }
};
