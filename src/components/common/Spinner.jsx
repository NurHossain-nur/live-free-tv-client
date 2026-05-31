import React from 'react';

export const Spinner = ({ size = 'w-10 h-10' }) => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
      <div 
        className={`${size} border-4 border-teal-500 border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
};