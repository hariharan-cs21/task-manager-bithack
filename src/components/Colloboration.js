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
                        <h1 className="text-xl font-semibold ml-3">Task Collaboration</h1>
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
                            className="rounded-full mr-2 ml-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown();
                            }}
                        />
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-14 p-2 mr-3 w-40 bg-white hover:bg-blue-100 rounded-md shadow-lg">
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
                <div className='md:w-1/2'>
                    <p className='bg-gray-800 p-2 text-white w-full text-center rounded-md md:ml-4'>Tasks Card</p>
                </div>
                <div className='md:w-1/2'>

                    <div>
                        {unShowForm ? (
                            <button onClick={onFormClick} className='bg-gray-800 rounded-md p-2 text-white w-24'>Add Task</button>
                        ) : (
                            <button className='w-24 bg-gray-800 rounded-md p-2 text-white' onClick={onUnformClick}>Close</button>
                        )}
                        {showForm &&
                            <div className="p-4 border border-blue-300 rounded shadow-md" style={{ maxHeight: "80vh", overflowY: "auto" }}>
                                <form className="space-y-6">
                                    <div className="flex flex-col">
                                        <label htmlFor="title" className="font-medium mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            className="border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500 rounded-lg"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="description" className="rounded-lg font-medium mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            className="border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500"
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
        </div>
    );
};

export default Collaboration;
