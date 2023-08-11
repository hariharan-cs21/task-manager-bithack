import React from 'react';
import { useNavigate } from 'react-router-dom';

const PersonalTask = ({ user }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center ml-2 cursor-pointer hover:bg-indigo-700 hover:text-white rounded-md p-1 transition duration-300 ease-in-out transform hover:scale-105">
                    <i className="uil uil-home text-xl"></i>
                    <p
                        className="font-bold text-lg mt-0.5 ml-0.5"
                        onClick={() => {
                            navigate('/dashboard');
                        }}
                    >
                        Home
                    </p>
                </div>

                <div className="flex flex-grow justify-center">
                    <div className="relative lg:w-4/12">
                        <input
                            type="text"
                            className="flex hover:border-indigo-300 border-indigo-700 border rounded-s-md p-4 h-10 rounded-r-lg w-full"
                            placeholder="Search Tasks..."
                            required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                            <i className="uil uil-search text-white  bg-indigo-500 p-2 rounded-r-lg"></i>
                        </div>
                    </div>
                </div>
                <div className='flex justify-between items-center mr-1'>
                    <img
                        src={user?.photoURL}
                        className="rounded-full cursor-pointer border-4 border-white hover:shadow-lg mr-1 transform hover:scale-105 transition duration-300 ease-in-out"
                        width="50px"
                        height="50px"
                        alt="avatar"
                    />
                </div>
            </div>
            <div className='flex justify-end m-3 p-1'>
                <p className='cursor-pointer border-double border-4 border-indigo:600 hover:bg-indigo-500 hover:text-white rounded-md p-1 transition duration-300 ease-in-out transform hover:scale-105'>Add task</p>
            </div>
        </>
    );
};

export default PersonalTask;
