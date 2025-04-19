'use client';

import { useState, useEffect } from 'react';

interface AIVerificationProcessProps {
  isVerifying: boolean;
  documents: File[];
  onComplete: (result: { isVerified: boolean; message: string; score?: number; details?: any }) => void;
}

const AIVerificationProcess: React.FC<AIVerificationProcessProps> = ({
  isVerifying,
  documents,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);

  const steps = [
    'Document preprocessing',
    'Analyzing document structure',
    'Extracting text and metadata',
    'Verifying with country database',
    'Checking for authenticity',
    'Generating verification score',
  ];

  useEffect(() => {
    if (!isVerifying) {
      setCurrentStep(0);
      setProgress(0);
      setAnalysisResults([]);
      return;
    }

    let step = 0;
    const totalSteps = steps.length;
    const stepDuration = 1000; // Each step takes 1 second

    // Simulate the AI verification process
    const interval = setInterval(() => {
      if (step < totalSteps) {
        setCurrentStep(step);
        setProgress(Math.floor((step / totalSteps) * 100));

        // Add a random analysis result for the current document
        if (documents.length > 0 && step > 0) {
          const randomResults = [
            'Document format is valid',
            'Detected official letterhead',
            'Signature verification passed',
            'Document date is within valid range',
            'School name matches database records',
            'Document contains valid security features',
            'Metadata verification successful',
            'Document hash matches expected pattern',
          ];

          const randomResult = randomResults[Math.floor(Math.random() * randomResults.length)];
          setAnalysisResults(prev => [...prev, `${documents[0].name}: ${randomResult}`]);
        }

        step++;
      } else {
        clearInterval(interval);
        setProgress(100);

        // Simulate verification result
        // In a real implementation, this would come from the AI service
        const isValid = documents.length > 0 &&
                        documents[0].name.length > 3 &&
                        !documents[0].name.toLowerCase().includes('fake');

        setTimeout(() => {
          // Always return success for demo purposes
          const result = {
            isVerified: true,
            message: 'Verification successful! Your application has been verified and sent to the DAO for voting.',
            score: 0.95,
            details: {
              verificationTime: new Date().toISOString(),
              verificationMethod: 'document analysis',
            }
          };

          console.log('Verification complete, returning result:', result);
          onComplete(result);
        }, 1000);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVerifying, documents, steps.length, onComplete]);

  if (!isVerifying) {
    return null;
  }

  return (
    <div className="mt-6 mb-6 bg-white p-4 rounded-lg border border-[#AEE3FF]">
      <h3 className="text-lg font-medium text-[#082865] mb-2">AI Verification in Progress</h3>

      <div className="w-full bg-[#E8F8FF] rounded-full h-2.5 mb-4">
        <div
          className="bg-[#0046D7] h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {index < currentStep ? (
              <svg className="h-5 w-5 text-[#0046D7] mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : index === currentStep ? (
              <svg className="h-5 w-5 text-[#0046D7] mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-[#AEE3FF] mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`text-sm ${index <= currentStep ? 'text-[#082865]' : 'text-[#0046D7]'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>

      {analysisResults.length > 0 && (
        <div className="mt-4 p-3 bg-[#E8F8FF] rounded border border-[#AEE3FF]">
          <h4 className="text-sm font-medium text-[#082865] mb-2">Analysis Results:</h4>
          <ul className="text-xs text-[#0046D7] space-y-1">
            {analysisResults.map((result, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-4 w-4 text-[#0046D7] mr-1 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {result}
              </li>
            ))}
          </ul>
        </div>
      )}

      {progress === 100 && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-[#0046D7] rounded-full"></div>
            <div className="h-2 w-2 bg-[#0046D7] rounded-full"></div>
            <div className="h-2 w-2 bg-[#0046D7] rounded-full"></div>
          </div>
          <span className="ml-2 text-sm text-[#082865]">Finalizing verification...</span>
        </div>
      )}
    </div>
  );
};

export default AIVerificationProcess;
