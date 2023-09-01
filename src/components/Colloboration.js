import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './Config/firebaseconfig';
import colab from "./colab.gif"

const Collaboration = ({ user, setloggedIn }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const isadmin = "linktothedeveloper@gmail.com";

    let navigate = useNavigate()
    const LogutUser = () => {
        signOut(auth).then(() => {
            localStorage.clear();
            setloggedIn(false);
            setIsDropdownOpen(false);
            navigate("/")
        });
    };

    const handleProfile = () => {
        navigate("/profile");
    };
    const [showForm, setShowForm] = useState(false)
    const [unShowForm, setunShowForm] = useState(true)

    const onFormClick = () => {
        setShowForm(true)
        setunShowForm(false)
    }
    const onUnformClick = () => {
        setShowForm(false)
        setunShowForm(true)
    }

    return (
        <div>
            <nav className="bg-white p-4">
                <div className="flex items-center justify-between">
                    <div className='flex items-center'>
                        <h1 className="text-xl font-semibold ml-6">Task Collaboration</h1>
                        <img
                            src={colab}
                            alt='colab'
                            className='h-10 w-10 hidden sm:block'
                        />
                    </div>

                    <div className="flex items-center">
                        <p>{user?.displayName}</p>
                        <img
                            src={user?.photoURL}
                            alt="Profile"
                            width="32px"
                            height="32px"
                            className="rounded-full mr-2 ml-2 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown();
                            }}
                        />
                        {isDropdownOpen && (
                            <div className="absolute  right-0 mt-14 p-2 mr-3 w-40 bg-white hover:bg-blue-100 rounded-md shadow-lg">
                                <option className="hover:bg-blue-200 rounded-md" style={{ cursor: "pointer" }} onClick={handleProfile}>
                                    View Profile
                                </option>
                                <option className="hover:bg-blue-200 rounded-md" style={{ cursor: "pointer" }} onClick={LogutUser}>
                                    Logout
                                </option>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className='flex flex-col md:flex-row gap-10'>
                <div className='md:w-1/2 overflow-y-auto '>
                    <div className='p-6 rounded-lg' style={{ maxHeight: '85vh', overflowY: "scroll" }}>

                        <div className='space-y-4 sm:h-full '>
                            <div className='bg-white p-6 rounded-lg shadow-md border border-blue-600'>
                                <h3 className='text-2xl font-semibold mb-2'>Task Title</h3>
                                <p className='text-gray-700 mb-4'>
                                    Description of the task goes here. It can be a detailed explanation of the task that needs to be accomplished.
                                </p>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-500'>Due Date: 2023-09-15</span>
                                    <span className='text-sm text-gray-500'>Priority: High</span>
                                </div>
                                <div className='mt-3'>
                                    <span className='text-sm text-gray-500'>Collaborators: user@example.com, user2@example.com</span>
                                </div>
                            </div>
                            <div className='bg-white p-6 rounded-lg shadow-md border border-blue-600'>
                                <h3 className='text-2xl font-semibold mb-2'>Task Title</h3>
                                <p className='text-gray-700 mb-4'>
                                    Description of the task goes here. It can be a detailed explanation of the task that needs to be accomplished.
                                </p>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-500'>Due Date: 2023-09-15</span>
                                    <span className='text-sm text-gray-500'>Priority: High</span>
                                </div>
                                <div className='mt-3'>
                                    <span className='text-sm text-gray-500'>Collaborators: user@example.com, user2@example.com</span>
                                </div>
                            </div>
                            <div className='bg-white p-6 rounded-lg shadow-md border border-blue-600'>
                                <h3 className='text-2xl font-semibold mb-2'>Task Title</h3>
                                <p className='text-gray-700 mb-4'>
                                    Description of the task goes here. It can be a detailed explanation of the task that needs to be accomplished.
                                </p>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-500'>Due Date: 2023-09-15</span>
                                    <span className='text-sm text-gray-500'>Priority: High</span>
                                </div>
                                <div className='mt-3'>
                                    <span className='text-sm text-gray-500'>Collaborators: user@example.com, user2@example.com</span>
                                </div>
                            </div>
                            <div className='bg-white p-6 rounded-lg shadow-md border border-blue-600'>
                                <h3 className='text-2xl font-semibold mb-2'>Task Title</h3>
                                <p className='text-gray-700 mb-4'>
                                    Description of the task goes here. It can be a detailed explanation of the task that needs to be accomplished.
                                </p>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-500'>Due Date: 2023-09-15</span>
                                    <span className='text-sm text-gray-500'>Priority: High</span>
                                </div>
                                <div className='mt-3'>
                                    <span className='text-sm text-gray-500'>Collaborators: user@example.com, user2@example.com</span>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {user?.email === isadmin &&
                    <div className='md:w-1/2'>
                        <div className='md:flex md:flex-col'>

                            <div>
                                {unShowForm ? (
                                    <button onClick={onFormClick} className='bg-gray-800 rounded-md p-2 top-1 text-white w-24'>Add Task</button>
                                ) : (
                                    <button className='w-24 bg-gray-800 rounded-md p-2 text-white' onClick={onUnformClick}>Close</button>
                                )}
                                {showForm &&
                                    <div className="p-6 shadow-md rounded-lg  bg-white mt-4" style={{ maxHeight: "78vh", overflowY: "auto" }}>
                                        <form className="space-y-4">
                                            <div className="flex flex-col">
                                                <label htmlFor="title" className="text-sm font-medium mb-1 text-gray-600">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="description" className="text-sm font-medium mb-1 text-gray-600">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                                                    rows="4"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="dueDate" className="font-medium mb-1">
                                                    Due Date
                                                </label>
                                                <input
                                                    type="date"
                                                    id="dueDate"
                                                    className="rounded-lg border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="priority" className="font-medium mb-1">
                                                    Priority
                                                </label>
                                                <select
                                                    id="priority"
                                                    className="rounded-lg border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="collaborators" className="font-medium mb-1">
                                                    Collaborators
                                                </label>
                                                <input
                                                    type="text"
                                                    id="collaborators"
                                                    className="rounded-lg border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                                                    placeholder="Add collaborators' emails"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Separate emails with commas
                                                </p>
                                            </div>
                                            <div className="flex justify-end">
                                                <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                                                    Assign
                                                </button>
                                            </div>
                                        </form>
                                    </div>


                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div >
    );
};

export default Collaboration;
