import React, { useState } from 'react';

const TaskCard = ({ tasks, currentUserEmail, isAdmin, handleAcceptTask, handleTransferTask }) => {
    const userTasks = isAdmin ? tasks : tasks.filter(task => task.assignedTo === currentUserEmail);
    const [transferToEmail, setTransferToEmail] = useState("")

    return (
        <div className='w-full ml-2'>
            {userTasks.map((task) => (
                <div key={task.id} className='p-4 bg-white rounded-lg shadow mb-4 flex flex-wrap md:flex-nowrap items-center'>
                    <div className='flex-grow'>
                        <h2 className='text-xl font-bold'>{task.Task}</h2>
                        <p className='text-gray-600'>{task.description}</p>
                        <p className='text-sm text-gray-500'>Assigned To: {task.assignedTo}</p>
                        {task.acceptedBy && (
                            <p className='text-sm text-gray-500'>Accepted By: {task.acceptedBy}</p>
                        )}
                        <p className={`text-sm ${task.acceptedBy ? 'text-green-500' : 'text-orange-500'}`}>
                            {task.acceptedBy ? 'Accepted' : 'Pending'}
                        </p>
                        {task.dueDate && <p className='text-sm text-gray-500'>Due Date: {task.dueDate}</p>}
                    </div>
                    {!task.acceptedBy && currentUserEmail === task.assignedTo && (
                        <button
                            onClick={() => handleAcceptTask(task.id)}
                            className='px-4 py-2 bg-blue-500 text-white rounded'
                        >
                            Accept
                        </button>
                    )}
                    {isAdmin && (
                        <>
                            <input
                                type='text'
                                placeholder='Enter the email to transfer'
                                className='px-4 py-2 border rounded'
                                onChange={(e) => setTransferToEmail(e.target.value)} // Save the value to a state (e.g., transferToEmail)
                            />
                            <button
                                onClick={() => handleTransferTask(task.id, transferToEmail)} // Use the transferToEmail state as the target email for transfer
                                className='px-4 py-2 bg-green-500 text-white rounded'
                            >
                                Transfer
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TaskCard;
