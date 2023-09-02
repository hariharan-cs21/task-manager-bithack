import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './Config/firebaseconfig';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { collection, addDoc, getDocs } from 'firebase/firestore';
const TaskCountsDialog = ({ taskCountsByUser, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-md max-w-md">
            <h3 className="text-lg font-semibold mb-2">Task Counts</h3>
            <ul>
                {Object.entries(taskCountsByUser).map(([userEmail, counts]) => (
                    <li key={userEmail} style={{ textTransform: "capitalize" }}>
                        {userEmail}:
                        Completed: {counts.completed} tasks
                        Pending: {counts.pending} tasks
                    </li>
                ))}
            </ul>
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                onClick={onClose}
            >
                Close
            </button>
        </div>
    </div>
);

const TaskCard = ({
    tasks,
    currentUserEmail,
    isAdmin,
    handleAcceptTask,
    handleTransferTask,
    handleDeleteTask,
    handleRejectTask, setRejectionMessage, rejectionMessage,
    calculateTimeRemaining,
    handleSubtaskCheckboxChange,
}) => {
    const userTasks = isAdmin ? tasks : tasks.filter(task => task.assignedTo === currentUserEmail);
    const [transferToEmail, setTransferToEmail] = useState('');
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
        const sortedTasks = tasks.slice().sort((a, b) => {
            const priorityOrder = { High: 1, Medium: 2, Low: 3 };
            return priorityOrder[a.Priority] - priorityOrder[b.Priority];
        });
        return sortedTasks;
    };

    const sortedTasks = sortPriority ? sortTasksByPriority(userTasks) : userTasks;

    const completedTasks = sortedTasks.filter(task => task.progress === 100 && task.imagesData && task.imagesData.length > 0);
    const pendingTasks = sortedTasks.filter(task => !(task.progress === 100 && task.imagesData && task.imagesData.length > 0));

    const [imageUpload, setImageUpload] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    const uploadFile = async (task) => {
        if (imageUpload == null) return;

        const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);

        try {
            const snapshot = await uploadBytes(imageRef, imageUpload);
            alert('File uploaded successfully');

            const url = await getDownloadURL(snapshot.ref);

            const taskImagesCollection = collection(db, `tasks/${task.id}/images`);
            const newImageDocRef = await addDoc(taskImagesCollection, { imageUrl: url, fileName: selectedFileName });

            setSelectedFileName('');

            return newImageDocRef.id;
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    useEffect(() => {
        const fetchImageUrls = async () => {
            for (const task of tasks) {
                const taskImagesCollection = collection(db, `tasks/${task.id}/images`);
                const querySnapshot = await getDocs(taskImagesCollection);
                const imagesData = querySnapshot.docs.map((doc) => doc.data());
                task.imagesData = imagesData;

                if (task.progress === 100) {
                    const imageUrls = imagesData.map(imageData => imageData.imageUrl);
                    task.imageUrls = imageUrls;
                }
            }
        };
        fetchImageUrls();
    }, [tasks]);
    const [searchInput, setSearchInput] = useState('');
    const [searchButtonClicked, setSearchButtonClicked] = useState(false);

    const handleSearchButtonClick = () => {
        setSearchButtonClicked(true);
    };

    const filterTasks = (tasks, searchInput) => {
        if (!searchInput) {
            return tasks;
        }

        const lowerCaseSearch = searchInput.toLowerCase();
        return tasks.filter(task => {
            return (
                task.Task.toLowerCase().includes(lowerCaseSearch) ||
                task.description.toLowerCase().includes(lowerCaseSearch)
            );
        });
    };

    const filteredTasks = searchButtonClicked
        ? filterTasks(pendingTasks, searchInput)
        : pendingTasks;

    const taskCountsByUser = {};

    tasks.forEach((task) => {
        const assignedTo = task.assignedTo;
        if (assignedTo) {
            const emailParts = assignedTo.split('.');
            const emailToShow = emailParts[0];

            if (!taskCountsByUser[emailToShow]) {
                taskCountsByUser[emailToShow] = { completed: 0, pending: 0 };
            }
            if (task.progress === 100 && task.imagesData && task.imagesData.length > 0) {
                taskCountsByUser[emailToShow].completed++;
            } else {
                taskCountsByUser[emailToShow].pending++;
            }
        }
    });

    return (

        <div className="w-full overflow-x-auto">

            <div className='flex items-center mb-4'>
                <input
                    type="text"
                    placeholder="Search tasks"
                    className="border p-1 rounded mb-3 w-1/2 ml-6"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                    onClick={handleSearchButtonClick}
                    className="ml-4 mb-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300"
                >
                    Search
                </button>
                <button
                    onClick={() => setSortPriority(!sortPriority)}
                    className="ml-4 mb-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg border border-gray-300 transition duration-300"
                >
                    {sortPriority ? 'Sort by Default' : 'Sort by Priority'}
                </button>

            </div>
            {isAdmin && (
                <div className="p-4 bg-white rounded-lg shadow-md mb-4 max-w-md ml-2">
                    <ul>
                        {Object.entries(taskCountsByUser).map(([userEmail, counts]) => (
                            <li key={userEmail} style={{ textTransform: "capitalize" }}>
                                <div className='flex'>
                                    <p>
                                        {userEmail}: </p>
                                    <p className='ml-1'>Completed:</p><p className='ml-1'>{counts.completed} </p>
                                    <p className='ml-1'>
                                        Pending:</p><p className='ml-1'> {counts.pending}</p>
                                </div>
                            </li>
                        ))}

                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 ml-2 md:grid-cols-2 gap-4">

                <div>
                    <h3 className="text-xl font-bold mb-3">Pending Tasks</h3>
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`p-4 bg-white rounded-lg shadow-md mb-4 ${expandedTaskId === task.id ? 'border-2 border-blue-500' : ''
                                }`}
                        >                            <div className="flex flex-wrap items-center">
                                <div className="flex-grow">
                                    <div onClick={() => toggleExpand(task.id)} className="cursor-pointer p-1">
                                        <div className="flex justify-between items-center mb-3">
                                            <h2 className="text-xl font-bold">{task.Task}</h2>
                                            <div className="flex items-center">
                                                <span className={`text-sm font-semibold ${task.Priority === 'High' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {task.Priority}
                                                </span>

                                                <span className="text-sm text-gray-500 ml-2">| Due : {task.dueDate}</span>

                                            </div>
                                        </div>
                                        {task.status === 'rejected' &&
                                            (
                                                (auth.currentUser.email === task.assignedTo && task.rejectedBy === auth.currentUser.email) ||
                                                isAdmin
                                            ) && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-semibold text-red-500">
                                                        Rejection reason: {task.rejectionMessage}
                                                    </p>
                                                </div>
                                            )}

                                        <div className="h-1 bg-gray-300 rounded">
                                            <div className={`h-full bg-${task.acceptedBy ? 'green' : 'orange'}-500 rounded`} style={{ width: `${task.progress}%` }} />
                                        </div>
                                        <p className="text-blue-500 text-sm">{task.progress.toFixed(1)}%</p>
                                    </div>
                                    {expandedTaskId === task.id && (
                                        <div className="mt-4">
                                            <p className="text-gray-600">{task.description}</p>
                                            <p>Time Remaining : {calculateTimeRemaining(task.dueDate)}</p>
                                            <p className="text-sm text-gray-500">Assigned To: {task.assignedTo}</p>
                                            {task.acceptedBy && (
                                                <p className="text-sm text-gray-500">Accepted By: {task.acceptedBy}</p>

                                            )}
                                            <div className="mt-4">
                                                <div className="border p-4 rounded-lg bg-white shadow-md">
                                                    {currentUserEmail === task.assignedTo && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Attach File</label>
                                                            <div className="mt-1 flex items-center">
                                                                <label className="relative inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                                                    <input type="file" className="sr-only" onChange={(event) => {
                                                                        setImageUpload(event.target.files[0]);
                                                                        setSelectedFileName(event.target.files[0].name);
                                                                    }} />
                                                                    Choose File
                                                                </label>
                                                                {selectedFileName && (
                                                                    <div className="text-xs text-gray-600">{selectedFileName}</div>
                                                                )}
                                                                <button
                                                                    className="ml-3 inline-flex items-center px-1 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                                                                    onClick={() => {
                                                                        setImageUpload(null);
                                                                        setSelectedFileName('');
                                                                    }}
                                                                >
                                                                    Remove
                                                                </button>
                                                                <button
                                                                    className="ml-3 inline-flex items-center px-1 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
                                                                    onClick={() => uploadFile(task)}
                                                                >
                                                                    Upload
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {task.imagesData && task.imagesData.length >= 0 && (
                                                        <div className="mt-4">
                                                            {task.imagesData.length === 0 ?
                                                                <p className="text-sm font-semibold">No Files uploaded</p> :
                                                                <p className="text-sm font-semibold">Attachments: </p>}
                                                            {task.imagesData.map((imageData, index) => (
                                                                <div key={index} className="mt-2">
                                                                    <a href={imageData.imageUrl} download={imageData.fileName} className="text-green-600 hover:text-green-800">
                                                                        View Attachment {index + 1}
                                                                    </a>

                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {task.subtasks && task.subtasks.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-semibold">Subtasks:</p>
                                                    <ul className="grid grid-cols-2 gap-2 mt-2">
                                                        {task.subtasks.map((subtask, index) => (
                                                            <li key={index} className="flex items-center">
                                                                {auth.currentUser.uid !== task.queryPerson.id && (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={subtask.checked}
                                                                        onChange={() => handleSubtaskCheckboxChange(task.id, index)}
                                                                        className="mr-2"
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
                                        </div>
                                    )}
                                </div>
                                {!task.acceptedBy && currentUserEmail === task.assignedTo && (
                                    <button
                                        onClick={() => handleAcceptTask(task.id)}
                                        className="px-3 mt-1 py-1 bg-blue-500 text-white rounded"
                                    >
                                        Accept
                                    </button>
                                )}
                                {!task.acceptedBy && currentUserEmail === task.assignedTo && (
                                    <>
                                        <input
                                            type='text'
                                            required
                                            placeholder='Reason for Rejection'
                                            className='border'
                                            onChange={(e) => setRejectionMessage(e.target.value)}
                                        />
                                        <button
                                            className="bg-red-500 text-white py-1 px-1 rounded ml-1"
                                            onClick={() => handleRejectTask(task.id, rejectionMessage)}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                            </div>
                            {isAdmin && (
                                <div className="mt-4 flex flex-col md:flex-row items-center">
                                    <input
                                        type="text"
                                        placeholder="Enter email to transfer"
                                        className="px-4 py-2 border rounded mb-2 md:mb-0 md:mr-2"
                                        onChange={(e) => setTransferToEmail(e.target.value)}
                                    />
                                    <div className="flex justify-between gap-2">
                                        <button
                                            onClick={() => handleTransferTask(task.id, transferToEmail)}
                                            className="px-4 py-2 bg-green-500 text-white rounded"
                                        >
                                            Transfer
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="px-2 py-2 bg-red-500 text-white rounded md:ml-2"
                                        >
                                            Delete
                                        </button>
                                    </div>


                                </div>

                            )}
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-3">Completed Tasks</h3>
                    {completedTasks.map((task) => (


                        <div
                            key={task.id}
                            className={`p-4 bg-white rounded-lg shadow-md mb-4 ${expandedTaskId === task.id ? 'border-2 border-blue-500' : ''
                                }`}
                        >
                            <div className="flex flex-wrap items-center">
                                <div className="flex-grow">
                                    <div onClick={() => toggleExpand(task.id)} className="cursor-pointer p-1">
                                        <div className="flex justify-between items-center mb-3">
                                            <h2 className="text-xl font-bold">{task.Task}</h2>
                                            <div className="flex items-center">
                                                <span className={`text-sm font-semibold ${task.Priority === 'High' ? 'text-red-500' : 'text-green-500'}`}>
                                                    Priority : {task.Priority}
                                                </span>
                                                <span className="text-sm text-gray-500 ml-2">| Due : {task.dueDate}</span>
                                            </div>
                                        </div>
                                        <div className="h-1 bg-gray-300 rounded">
                                            <div className={`h-full bg-${task.acceptedBy ? 'green' : 'orange'}-500 rounded`} style={{ width: `${task.progress}%` }} />
                                        </div>
                                        <p className="text-blue-500 text-sm">{task.progress.toFixed(1)}%</p>
                                    </div>
                                    {expandedTaskId === task.id && (
                                        <div className="mt-4">
                                            <p className="text-gray-600">{task.description}</p>
                                            <p>Time Remaining : {calculateTimeRemaining(task.dueDate)}</p>
                                            <p className="text-sm text-gray-500">Assigned To: {task.assignedTo}</p>
                                            {task.acceptedBy && (
                                                <p className="text-sm text-gray-500">Accepted By: {task.acceptedBy}</p>
                                            )}
                                            <div className="mt-4">

                                                {task.imageUrls && task.imageUrls.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-semibold">Attachments</p>
                                                        {task.imageUrls.map((url, index) => (
                                                            <div key={index} className="mt-2">
                                                                <a href={url} download={`image-${index + 1}.jpg`} className="text-green-600 hover:text-green-800">
                                                                    View Attachment {index + 1}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}


                                            </div>
                                            {task.subtasks && task.subtasks.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-semibold">Subtasks:</p>
                                                    <ul className="grid grid-cols-2 gap-2 mt-2">
                                                        {task.subtasks.map((subtask, index) => (
                                                            <li key={index} className="flex items-center">
                                                                {auth.currentUser.uid !== task.queryPerson.id && (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={subtask.checked}
                                                                        onChange={() => handleSubtaskCheckboxChange(task.id, index)}
                                                                        className="mr-2"
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
                                        </div>
                                    )}
                                </div>


                            </div>

                            {isAdmin && (
                                <>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="px-2 py-2 bg-red-500 text-white rounded md:ml-2"
                                    >
                                        Delete
                                    </button>

                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default TaskCard;
