import React, { useState } from 'react';
import { auth } from './Config/firebaseconfig';

const TaskCard = ({
    tasks,
    currentUserEmail,
    isAdmin,
    handleAcceptTask,
    handleTransferTask,
    handleDeleteTask,
    calculateTimeRemaining,
    handleSubtaskCheckboxChange,
}) => {
    const userTasks = isAdmin ? tasks : tasks.filter(task => task.assignedTo === currentUserEmail);
    const [transferToEmail, setTransferToEmail] = useState("");

    return (
        <div className='w-full ml-2'>
            {userTasks.map((task) => (
                <div key={task.id} className='p-4 bg-white rounded-lg shadow mb-4'>
                    <div className='flex flex-wrap md:flex-nowrap items-center'>
                        <div className='flex-grow'>
                            <h2 className='text-xl font-bold mb-2'>{task.Task}</h2>
                            <p className='text-gray-600 mb-4'>{task.description}</p>
                            <div className='flex items-center mb-2'>
                                <p className='text-sm font-semibold mr-2'>Progress:</p>
                                <div className='w-5/12 h-3 bg-gray-300 rounded'>
                                    <div
                                        className={`h-full bg-${task.acceptedBy ? 'green' : 'orange'
                                            }-500 rounded`}
                                        style={{ width: `${task.progress}%` }}
                                    >

                                    </div>
                                </div>
                                <p className='ml-1'>{(task.progress).toFixed(1)}%</p>
                            </div>
                            <p className='text-sm text-gray-500'>
                                Assigned To: {task.assignedTo}
                            </p>
                            {task.acceptedBy && (
                                <p className='text-sm text-gray-500'>
                                    Accepted By: {task.acceptedBy}
                                </p>
                            )}
                            <p
                                className={`text-sm ${task.acceptedBy ? 'text-green-500' : 'text-orange-500'
                                    }`}
                            >
                                {task.acceptedBy ? 'Accepted' : 'Pending'}
                            </p>
                            {task.dueDate && (
                                <p className='text-sm text-gray-500'>
                                    Due Date: {task.dueDate}
                                </p>
                            )}
                            {task.dueDate && (
                                <p className='text-sm text-gray-500'>
                                    Time Remaining: {calculateTimeRemaining(task.dueDate)}
                                </p>
                            )}
                        </div>
                        {!task.acceptedBy && currentUserEmail === task.assignedTo && (
                            <button
                                onClick={() => handleAcceptTask(task.id)}
                                className='px-4 py-2 bg-blue-500 text-white rounded'
                            >
                                Accept
                            </button>
                        )}
                    </div>
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className='mt-4'>
                            <p className='text-sm font-semibold'>Subtasks:</p>
                            <ul className='grid grid-cols-2 gap-2 mt-2'>
                                {task.subtasks.map((subtask, index) => (
                                    <li key={index} className='flex items-center'>
                                        {auth.currentUser?.uid !== task.queryPerson.id && (
                                            <input
                                                type='checkbox'
                                                checked={subtask.checked}
                                                onChange={() => handleSubtaskCheckboxChange(task.id, index)}
                                                className='mr-2'
                                            />
                                        )}
                                        <p className={subtask.checked ? 'line-through text-gray-500' : 'text-black'}>
                                            {subtask.title}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {isAdmin && (
                        <div className='mt-4 flex flex-col md:flex-row items-center'>
                            <input
                                type='text'
                                placeholder='Enter email to transfer'
                                className='px-4 py-2 border rounded mb-2 md:mb-0 md:mr-2'
                                onChange={(e) => setTransferToEmail(e.target.value)}
                            />
                            <button
                                onClick={() => handleTransferTask(task.id, transferToEmail)}
                                className='px-4 py-2 bg-green-500 text-white rounded'
                            >
                                Transfer
                            </button>
                            <button
                                onClick={() => handleDeleteTask(task.id)}
                                className='px-4 py-2 bg-red-500 text-white rounded md:ml-2'
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TaskCard;
