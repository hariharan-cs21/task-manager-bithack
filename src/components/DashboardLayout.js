import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Collaboration from './Colloboration';

const DashboardLayout = ({ user, setloggedIn }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setTimeout(() => {
            setSidebarOpen(false);

        }, 3000);
    };

    useEffect(() => {
        if (window.innerWidth < 768) {
            const timeout = setTimeout(() => {
                setSidebarOpen(false);
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, []);

    return (
        <div className="flex h-screen bg-blue-50">
            <div
                className={`fixed inset-y-0 z-10 flex flex-col w-48 bg-gray-800 transform ease-in-out transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex-shrink-0 ${sidebarOpen ? '' : '-translate-x-full'
                    } lg:w-48`}
            >
                <nav className="flex-grow font-bold">
                    <Link to="/dashboard">
                        <p className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl">
                            <i className="uil uil-dashboard ml-2 text-xl"></i>
                            <span className='ml-1 whitespace-no-wrap'>Dashboard</span>
                        </p>
                    </Link>
                    <Link to='/chat'>
                        <p
                            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white mt-32 rounded-xl"
                        >
                            <i className="uil uil-chat ml-2 text-2xl mr-1"></i>
                            <span className='ml-1 '>Messenger</span>
                        </p>
                    </Link>
                    <Link to="/colloborate">
                        <p className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl">
                            <i className="uil uil-users-alt ml-2 text-2xl"></i>
                            <span className='ml-1 '>Collaboration</span>
                        </p>
                    </Link>
                </nav>
            </div>

            <div className="flex flex-col flex-1">
                <button
                    className="fixed mt-4 left-2 p-1 rounded-md w-6 h-6 lg:hidden"
                    onClick={toggleSidebar}
                >
                    {sidebarOpen ? null : <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 6H20M4 12H20M4 18H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        /></svg>}
                </button>

                <Collaboration user={user} setloggedIn={setloggedIn} />
            </div>
        </div>
    );
};

export default DashboardLayout;
