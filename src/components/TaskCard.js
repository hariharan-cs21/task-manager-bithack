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
    const [sortPriority, setSortPriority] = useState(false);
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    const toggleExpand = (taskId) => {
        if (expandedTaskId === taskId) {
            setExpandedTaskId(null);
        } else {
            setExpandedTaskId(taskId);
        }
    };
    const sortTasksByPriority = (tasks) => {
        console.log("Tasks before sorting:", tasks);
        const sortedTasks = tasks.slice().sort((a, b) => {
            const priorityOrder = { High: 1, Medium: 2, Low: 3 };
            return priorityOrder[a.Priority] - priorityOrder[b.Priority];
        });
        console.log("Tasks after sorting:", sortedTasks);
        return sortedTasks;
    };

    const sortedTasks = sortPriority ? sortTasksByPriority(userTasks) : userTasks;

    return (
        <div className='w-full ml-2'>
            <button
                onClick={() => setSortPriority(!sortPriority)}
                className='px-4 py-2 bg-blue-500 text-white rounded mb-3'
            >
                {sortPriority ? 'Sort by Default' : 'Sort by Priority'}
            </button>
            {sortedTasks.map((task) => (
                <div key={task.id} className='p-4 bg-white rounded-lg shadow mb-4'>
                    <div className='flex flex-wrap items-center'>
                        <div className='flex-grow'>
                            <div onClick={() => toggleExpand(task.id)} className='cursor-pointer p-1'>
                                <div className='flex justify-between items-center mb-3'>
                                    <h2 className='text-xl font-bold'>{task.Task}</h2>
                                    <div className='flex items-center'>
                                        <span
                                            className={`text-sm font-semibold ${task.Priority === 'High' ? 'text-red-500' : 'text-green-500'
                                                }`}
                                        >
                                            Priority : {task.Priority}
                                        </span>
                                        <span className='text-sm text-gray-500 ml-2'>| Due : {task.dueDate}</span>
                                    </div>
                                </div>
                                <div className='h-1 bg-gray-300 rounded'>
                                    <div
                                        className={`h-full bg-${task.acceptedBy ? 'green' : 'orange'}-500 rounded`}
                                        style={{ width: `${task.progress}%` }}
                                    />

                                </div>
                                <p className='text-blue-500 text-sm'>
                                    {task.progress.toFixed(1)}%</p>
                            </div>
                            {expandedTaskId === task.id && (
                                <div className='mt-4'>
                                    <p className='text-gray-600'>{task.description}</p>
                                    <p>Time Remaining : {calculateTimeRemaining(task.dueDate)}</p>
                                    <p className='text-sm text-gray-500'>Assigned To: {task.assignedTo}</p>
                                    {task.acceptedBy && (
                                        <p className='text-sm text-gray-500'>Accepted By: {task.acceptedBy}</p>
                                    )}
                                    {task.subtasks && task.subtasks.length > 0 && (
                                        <div className='mt-4'>
                                            <p className='text-sm font-semibold'>Subtasks:</p>
                                            <ul className='grid grid-cols-2 gap-2 mt-2'>
                                                {task.subtasks.map((subtask, index) => (
                                                    <li key={index} className='flex items-center'>
                                                        {auth.currentUser.uid !== task.queryPerson.id &&
                                                            <input
                                                                type='checkbox'
                                                                checked={subtask.checked}
                                                                onChange={() => handleSubtaskCheckboxChange(task.id, index)}
                                                                className='mr-2'
                                                            />
                                                        }
                                                        <p className={subtask.checked ? 'line-through text-gray-500' : 'text-black'}>
                                                            {subtask.title}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {!task.acceptedBy && currentUserEmail === task.assignedTo && (
                            <button
                                onClick={() => handleAcceptTask(task.id)}
                                className='px-3 py-1 bg-blue-500 text-white rounded'
                            >
                                Accept
                            </button>
                        )}
                    </div>
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
