import React, { useEffect, useState } from 'react';
import { auth, db, storage } from './Config/firebaseconfig';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

const CollobTask = ({ task, tasks, isAssignedUser, updateTask }) => {
    const [imageUpload, setImageUpload] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const adminEmail = 'linktothedeveloper@gmail.com';
    const currentUserEmail = auth.currentUser?.email;
    const [editedTask, setEditedTask] = useState({ ...task });
    const [attachments, setAttachments] = useState({});

    const uploadFile = async (task) => {
        if (imageUpload == null) return;

        const imageRef = ref(storage, `collabimages/${imageUpload.name + v4()}`);

        try {
            const snapshot = await uploadBytes(imageRef, imageUpload);
            alert('File uploaded successfully');

            const url = await getDownloadURL(snapshot.ref);

            const taskImagesCollection = collection(db, `collab/${task.id}/images`);
            const newImageDocRef = await addDoc(taskImagesCollection, { imageUrl: url, fileName: selectedFileName });

            setSelectedFileName('');

            return newImageDocRef.id;
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleUpdateTask = async () => {
        try {
            if (currentUserEmail === adminEmail) {
                const taskDocRef = doc(db, 'collobTasks', task.id);

                await updateDoc(taskDocRef, editedTask);
                if (updateTask) {
                    updateTask(editedTask);
                }

                alert('Task updated successfully.');
            } else {
                alert('You do not have permission to edit this task.');
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
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

    useEffect(() => {
        const fetchImageUrls = async () => {
            if (Array.isArray(tasks) && tasks.length > 0) {
                const newAttachments = {};

                for (const task of tasks) {
                    const taskImagesCollection = collection(db, `collab/${task.id}/images`);
                    const querySnapshot = await getDocs(taskImagesCollection);
                    const imagesData = querySnapshot.docs.map((doc) => doc.data());

                    newAttachments[task.id] = imagesData;
                }

                setAttachments(newAttachments);
            }
        };

        fetchImageUrls();
    }, [tasks]);

    return (
        <div className={`bg-white mb-6   rounded-lg p-4 shadow-lg ${currentUserEmail === adminEmail ? 'border border-blue-500' : ''}`}>
            <div className="flex justify-between">
                <div className="w-2/3">
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">
                        {currentUserEmail === adminEmail ? (
                            <input
                                type="text"
                                value={editedTask.Task}
                                onChange={(e) => currentUserEmail === adminEmail && setEditedTask({ ...editedTask, Task: e.target.value })}
                                readOnly={currentUserEmail !== adminEmail}
                                className={`w-full border-b border-transparent hover:border-blue-500 transition-all duration-300 ${currentUserEmail === adminEmail ? 'hover:border-transparent focus:border-blue-500' : ''}`}
                            />
                        ) : (
                            editedTask.Task
                        )}
                    </h2>
                    <div className="text-sm text-gray-600 mb-2">
                        {currentUserEmail === adminEmail ? (
                            <textarea
                                value={editedTask.description}
                                onChange={(e) => currentUserEmail === adminEmail && setEditedTask({ ...editedTask, description: e.target.value })}
                                readOnly={currentUserEmail !== adminEmail}
                                rows={2}
                                className={`w-full resize-none border-b border-transparent hover:border-blue-500 transition-all duration-300 ${currentUserEmail === adminEmail ? 'hover:border-transparent focus:border-blue-500' : ''}`}
                            />
                        ) : (
                            editedTask.description
                        )}
                    </div>
                </div>
                <div className="w-1/3 ml-4">
                    <div className={`text-sm ${getPriorityColor(editedTask.Priority)}`}>
                        Priority:
                        {currentUserEmail === adminEmail ? (
                            <select
                                value={editedTask.Priority}
                                onChange={(e) => currentUserEmail === adminEmail && setEditedTask({ ...editedTask, Priority: e.target.value })}
                                readOnly={currentUserEmail !== adminEmail}
                                className={`ml-1 border-b border-transparent hover:border-blue-500 transition-all duration-300 ${currentUserEmail === adminEmail ? 'hover:border-transparent focus:border-blue-500' : ''}`}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        ) : (
                            editedTask.Priority
                        )}
                    </div>
                    {currentUserEmail === adminEmail && (
                        <div className="mt-4">
                            <button
                                className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
                                onClick={handleUpdateTask}
                            >
                                Update
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {isAssignedUser && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Attach File</label>
                    <div className="mt-2 flex items-center">
                        <label className="relative inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <input
                                type="file"
                                className="sr-only"
                                onChange={(event) => {
                                    setImageUpload(event.target.files[0]);
                                    setSelectedFileName(event.target.files[0].name);
                                }}
                            />
                            Choose File
                        </label>
                        {selectedFileName && (
                            <div className="text-xs text-gray-600">{selectedFileName}</div>
                        )}
                        <button
                            className="ml-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                            onClick={() => {
                                setImageUpload(null);
                                setSelectedFileName('');
                            }}
                        >
                            Remove
                        </button>
                        <button
                            className="ml-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
                            onClick={() => uploadFile(task)}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            )}
            <div className="mt-4">
                {attachments[task.id] && attachments[task.id].length === 0 ? (
                    <p className="text-sm font-semibold">No Files uploaded</p>
                ) : (
                    <div>
                        <p className="text-sm font-semibold">Attachments: </p>
                        {attachments[task.id] &&
                            attachments[task.id].map((attachment, index) => (
                                <div key={index} className="mt-1">
                                    <a href={attachment.imageUrl} download={attachment.fileName} className="text-blue-500 hover:underline">
                                        View Attachment {index + 1}
                                    </a>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
                Collaborators:<br />
                {task.assignedTo.map((collaborator, index) => (
                    <div key={index} className="flex items-center">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 6c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 22h-2c-1.11 0-2-.9-2-2v-2c0-2.21-1.79-4-4-4H7c-2.21 0-4 1.79-4 4v2c0 1.1-.9 2-2 2H3a1 1 0 01-1-1v-5a8.998 a 8.998 0 016.293-8.17"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 20a2 2 0 100-4 2 2 0 000 4z"
                                />
                            </svg>
                        </div>
                        <span>{collaborator.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollobTask;