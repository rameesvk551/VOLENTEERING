import React from 'react';
import { BiError } from 'react-icons/bi';

type HostDetailsErrorPageProps = {
  error: string;
};

const HostDetailsErrorPage: React.FC<HostDetailsErrorPageProps> = ({ error }) => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <BiError className="text-red-500" size={64} />
        </div>
        <h1 className="text-2xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default HostDetailsErrorPage;
