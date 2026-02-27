// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-blue-500 animate-spin"></div>
    </div>
);

export default LoadingSpinner;