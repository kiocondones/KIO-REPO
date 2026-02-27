import React, { useState } from 'react';

function Profile({ currentUser }) {
    const [showModal, setShowModal] = useState(false);

    const name = currentUser?.name || "Technician";
    const email = currentUser?.email || "";
    const role = currentUser?.role || "Technician";
    const department = currentUser?.department || "";

    // Generate initials from name (e.g. "Juan Dela Cruz" → "JDC")
    const initials = name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0].toUpperCase())
        .join("")
        .slice(0, 3);

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        sessionStorage.clear();

        console.log("User logged out");

        window.location.href = '/login'; 
    };

    return (
        <div className="pb-5 p-4 relative">
            <div className="p-6 rounded-2xl text-center mb-4">
                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className='text-4xl font-bold text-white'>
                        {initials}
                    </div>   
                </div>
                <h2 className="text-2xl font-bold mb-1 text-black">{name}</h2>
                <span className='text-gray-600'>{email}</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] mb-4">
                <h3 className="text-lg font-bold mb-4">Account Information</h3>

                <div className="flex flex-col gap-4">
                    {/* Role */}
                    <div className='flex items-center justify-between font-semibold'>
                        <div className="text-sm text-gray-500 mb-1">Role</div>
                        <div className="flex items-center gap-2">                        
                            <span>{role}</span>
                        </div>
                    </div>

                    {/* Department */}
                    <div className='flex items-center justify-between font-semibold'>
                        <div className="text-sm text-gray-500 mb-1">Department</div>
                        <div className="flex items-center gap-2">
                            <span>{department}</span>
                        </div>
                    </div>

                    {/* Email */}
                    <div className='flex items-center justify-between font-semibold'>
                        <div className="text-sm text-gray-500 mb-1">Email Address</div>
                        <div className="flex items-center gap-2">
                            <span>{email}</span>
                        </div>
                    </div>

                    {/* Logout Button - Now opens the modal */}
                    <button 
                        className="flex items-center justify-center gap-2 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"  
                        onClick={() => setShowModal(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span className="font-bold">Logout</span>
                    </button>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-white p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-center">
                <p className="text-sm text-gray-500 mb-1">GCG ServiceDesk Technician</p>
                <p className="text-sm text-gray-500 mb-3">Version 1.0</p>
                <p className="text-xs text-gray-400">© 2025 Simplevia Technologies Inc.</p>
                <p className="text-xs text-gray-400 mt-1">All rights reserved</p>
            </div>

            {/* --- LOGOUT CONFIRMATION MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Logout</h3>
                        <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out?</p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="flex-1 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;