import React from 'react';

const TextArea: React.FC = () => (
  <div>
    <textarea
      className="dark:bg-transparent block w-full md:w-[80%] lg:w-[90%] xl:w-[95%] ml-4 px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
    />
  </div>
);

export default TextArea;
