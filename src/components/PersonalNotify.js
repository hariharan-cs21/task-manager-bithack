import React from 'react';

const PersonalNotify = ({ setshowLayout, setshowNotificationBar, showNotificationBar, tasks }) => {
    function formatDate(date) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }
    return (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm ">
            <div className="bg-white rounded-lg shadow-lg p-8 w-max">
                <div className="flex justify-between items-center mb-4">
                    {showNotificationBar && (
                        <p
                            className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition duration-300"
                            onClick={() => {
                                setshowLayout(true);
                                setshowNotificationBar(false);
                            }}
                        >
                            ← Back
                        </p>
                    )}
                    <p className="text-blue-600 font-semibold text-sm">Notifications</p>

                </div>
                <div>
                    {tasks.map((task, index) => (
                        <div key={index} className="border-b border-gray-300 py-4">
                            <p className="text-gray-800 text-lg rounded-lg w-32 font-semibold  p-1 bg-blue-100  font-bold border border-blue-700">{task.title}</p>
                            <div className="flex  items-center mt-2">
                                <p className="p-1 rounded-lg text-gray-700 " style={{ textTransform: "capitalize" }}>Priority : {task.priority}</p>
                                <div className='flex'>
                                    <p className='mr-1'>|</p>
                                    <p className="rounded-lg text-gray-700 "> Due : {formatDate(new Date(task.dueDate))}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PersonalNotify;
