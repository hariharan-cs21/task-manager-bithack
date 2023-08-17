import React, { useState } from 'react';
import { Toast } from 'flowbite-react';
import { HiFire, HiX } from 'react-icons/hi';

export default function ToastWithCloseButton({ title }) {
    const [showToast, setShowToast] = useState(true);

    const handleCloseToast = () => {
        setShowToast(false);
    };

    return (
        <>
            {showToast && (
                <Toast
                    className="fixed right-0 top-0 m-2"
                    style={{
                        width: '100%',
                        maxWidth: '20rem',
                        animation: 'slide-in 0.3s ease-out'
                    }}
                >
                    <style>
                        {`
                            @keyframes slide-in {
                                0% {
                                    transform: translateX(100%);
                                }
                                100% {
                                    transform: translateX(0);
                                }
                            }
                        `}
                    </style>
                    <div className="flex items-center p-2 rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200">
                        <div className="h-6 w-6 flex items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200">
                            <HiFire className="h-4 w-4" />
                        </div>
                        <div className="ml-2 text-xs font-normal">
                            Task : {title} Added
                        </div>
                    </div>
                    <button
                        onClick={handleCloseToast}
                        className="ml-2 text-xs text-gray-600 hover:text-gray-800"
                    >
                        <HiX className="h-4 w-4" />
                    </button>
                </Toast>
            )}
        </>
    );
}
