// src/components/common/Toast.jsx
import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-gray-900'
    };

    return (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white shadow-xl z-[2000] max-w-[calc(100%-40px)] ${typeClasses[type] || typeClasses.info}`}>
            {message}
        </div>
    );
};

export default Toast;