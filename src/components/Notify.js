import React, { useState } from 'react';

const NotificationBar = ({ tasks, currentUserEmail }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const otherUserTasks = tasks.filter(task => task.assignedTo !== currentUserEmail);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowDetails(true);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
    };

    return (
        <div
            className="fixed m-4 ml-1  ml-1 max-w-lg mx-auto p-4 rounded-md bg-blue-500 text-white shadow-lg"
            style={{ maxHeight: '80vh', overflowY: 'auto', width: '100%' }}
        >
            {showDetails ? (
                <>
                    <h3 className="text-lg font-semibold mb-2">{selectedTask?.Task}</h3>
                    <p className="mb-4">{selectedTask?.description}</p>
                    <p className="text-xs text-gray-300 mb-2">Assigned To: {selectedTask?.assignedTo}</p>
                    <button
                        className="bg-white text-blue-500 px-3 py-1 rounded-full text-xs font-semibold"
                        onClick={handleCloseDetails}
                    >
                        Close Details
                    </button>
                </>
            ) : (
                <div>
                    <p>{otherUserTasks.length} task(s) assigned recently:</p>
                    <ul>
                        {otherUserTasks.map(task => (
                            <li key={task.id}>
                                <button
                                    className="text-left w-full py-1 font-semibold focus:outline-none"
                                    onClick={() => handleTaskClick(task)}
                                >
                                    {task.Task} - Assigned To: {task.assignedTo}
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
