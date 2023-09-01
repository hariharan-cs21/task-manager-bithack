import React from 'react';

const CollobTask = ({ task }) => {
    return (
        <>
            <div key={task.id} className='bg-white p-6 mt-6 rounded-lg shadow-md border border-gray-300 hover:shadow-xl transition duration-300'>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>{task.Task}</h3>
                <div className='flex flex-col'>
                    <p className='text-sm text-gray-600 mb-3'>{task.description}</p>
                </div>
                <div className='flex justify-between items-center'>
                    <p className='text-sm text-gray-500'>Due Date: {task.dueDate}</p>
                    <span className={`text-sm ${getPriorityColor(task.Priority)}`}>
                        Priority: {task.Priority}
                    </span>
                </div>
                <div className='mt-3'>
                    <span className='text-sm text-gray-500'>
                        Collaborators:<br></br>
                        {task.assignedTo.map((collaborator, index) => (
                            <span key={index}>
                                <span style={{ color: 'blue' }}>{collaborator.name}</span>
                                <span style={{ marginLeft: '5px' }}>({collaborator.email})</span>
                                <br />
                            </span>
                        ))}


                    </span>
                </div>
            </div>

        </>
    );
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'low':
            return 'text-green-500';
        case 'medium':
            return 'text-yellow-500';
        case 'high':
            return 'text-red-500';
        default:
            return 'text-gray-500';
    }
};

export default CollobTask;
