import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Collaboration from './Colloboration';

const DashboardLayout = ({ user, setloggedIn, isloggedIn }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
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
                    className="fixed top-3 left-1 p-2 rounded-md w-6 h-6 lg:hidden"
                    onClick={toggleSidebar}
                >
                    {sidebarOpen ? null : <i className="uil uil-ellipsis-v"></i>}
                </button>

                <Collaboration user={user} setloggedIn={setloggedIn} />
            </div>
        </div>
    );
};

export default DashboardLayout;
