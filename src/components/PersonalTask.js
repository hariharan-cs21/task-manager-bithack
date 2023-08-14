import React from 'react';
import { useNavigate } from 'react-router-dom';

const PersonalTask = ({ user }) => {
    const navigate = useNavigate();

    return (
        <>
            <div style={{ backgroundImage: `url("https://i.pinimg.com/600x315/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")` }} >
                <div className="flex items-center justify-between mt-2" >
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 m-6" >
                    <div className="w-full p-4 bg-white rounded-lg shadow flex-grow">
                        <h2 className="text-xl font-bold">Task</h2>
                        <p className="text-gray-600">good</p>
                        <p className="text-sm text-gray-500">Assigned To: me</p>
                    </div>
                    <div className="w-full p-4 bg-white rounded-lg shadow flex-grow">
                        <h2 className="text-xl font-bold">Task</h2>
                        <p className="text-gray-600">good</p>
                        <p className="text-sm text-gray-500">Assigned To: me</p>
                    </div>
                    <div className="w-full p-4 bg-white rounded-lg shadow flex-grow">
                        <h2 className="text-xl font-bold">Task</h2>
                        <p className="text-gray-600">good</p>
                        <p className="text-sm text-gray-500">Assigned To: me</p>
                    </div>
                </div>
            </div>

        </>
    );
};

export default PersonalTask;
