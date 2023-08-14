import React, { useState } from 'react';

const NotificationBar = ({ tasks, currentUserEmail, calculateTimeRemaining }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const isAdmin = currentUserEmail === 'linktothedeveloper@gmail.com';

    const userTasks = tasks.filter(task => task.assignedTo === currentUserEmail);
    const allTasks = isAdmin ? tasks : [];

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowDetails(true);
        const remainingTime = calculateTimeRemaining(task.dueDate);
        if (remainingTime.includes('Less than 24 hours')) {
            alert('This task has less than 24 hours remaining.');
        }
    };

    const handleCloseDetails = () => {
        setSelectedTask(null);
        setShowDetails(false);
    };

    return (
        <div className="fixed m-4 ml-1 max-w-lg mx-auto p-4 rounded-md bg-blue-500 text-white shadow-lg" style={{ maxHeight: '80vh', overflowY: 'auto', width: '100%' }}>
            {showDetails && selectedTask ? (
                <div className="text-white">
                    <h3 className="text-lg font-semibold mb-2">{selectedTask.Task}</h3>
                    <p className="mb-4">{selectedTask.description}</p>
                    <p className="text-xs text-gray-300 mb-2">Assigned To: {isAdmin ? selectedTask.assignedTo : 'You'}</p>
                    {selectedTask.dueDate && (
                        <p className="text-xs text-gray-300 mb-2">
                            Due Date: {selectedTask.dueDate} - Time Remaining: {calculateTimeRemaining(selectedTask.dueDate)}
                        </p>
                    )}
                    <button
                        className="bg-white text-blue-500 px-3 py-1 rounded-full text-xs font-semibold"
                        onClick={handleCloseDetails}
                        aria-label="Close Details"
                    >
                        Close Details
                    </button>
                </div>
            ) : (
                <div>
                    <p className="mb-2 text-white">{isAdmin ? allTasks.length : userTasks.length} task(s) assigned recently:</p>
                    <ul className="list-none">
                        {(isAdmin ? allTasks : userTasks).map(task => (
                            <li key={task.id}>
                                <button
                                    className="text-left w-full py-2 px-3 font-semibold focus:outline-none hover:bg-white hover:bg-opacity-10 rounded-lg transition"
                                    onClick={() => handleTaskClick(task)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{task.Task}</span>
                                        <span className="text-xs">Assigned To: {isAdmin ? task.assignedTo : 'You'}</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationBar;
