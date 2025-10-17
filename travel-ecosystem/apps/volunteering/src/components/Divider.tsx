import React from 'react';

interface DividerProps {
  label?: string;
}

const Divider: React.FC<DividerProps> = ({ label }) => (
  <div className="flex items-center mt-4">
    <div className="flex-1 border-t border-gray-300 dark:border-gray-500" />
    {label && <div className="mx-4 text-gray-400 text-sm">{label}</div>}
    <div className="flex-1 border-t border-gray-300 dark:border-gray-500" />
  </div>
);

export default Divider;
