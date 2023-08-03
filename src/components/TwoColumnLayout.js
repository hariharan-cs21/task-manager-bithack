import React, { useState, useEffect } from 'react';
import { auth, db } from './Config/firebaseconfig';
import { collection, addDoc, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import TaskCard from './TaskCard';

const TwoColumnLayout = () => {
    const [Priority, setPriority] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [acceptedTasks, setAcceptedTasks] = useState([]);

    const currentUserEmail = auth.currentUser?.email || "";

    const [Task, setTask] = useState("");
    const [description, setdescription] = useState("");
    const queryCollection = collection(db, "allQueries");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskAccepted, setTaskAccepted] = useState(false);
    const [tasks, setTasks] = useState([]);

    const submitQuery = async () => {
        if (Priority && Task && description && assignedTo) {
            setIsSubmitting(true);
            try {
                const queryPerson = {
                    name: auth.currentUser.displayName,
                    id: auth.currentUser.uid,
                    email: auth.currentUser.email,
                };
                await addDoc(queryCollection, {
                    Priority,
                    Task,
                    description,
                    assignedTo,
                    queryPerson,
                });
                alert("Uploaded");
                setPriority("");
                setTask("");
                setdescription("");
                setAssignedTo("");
                setTaskAccepted(true);
            } catch (error) {
                console.error("Error submitting query:", error);
            }
            setIsSubmitting(false);
        } else {
            alert("Please fill in all the fields, including Assign To.");
        }
    };

    const fetchTasks = async () => {
        try {
            const querySnapshot = await getDocs(queryCollection);
            const tasksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setTasks(tasksData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };
    const handleAssignTask = async (taskId, assignedTo) => {
        try {
            if (!taskId || !assignedTo) {
                alert("Task ID and Assignee Email cannot be empty.");
                return;
            }

            const taskDocRef = doc(db, "allQueries", taskId);
            await updateDoc(taskDocRef, {
                assignedTo: assignedTo,
                acceptedBy: null,
            });
            alert(`Task assigned to ${assignedTo}`);
            fetchTasks();
        } catch (error) {
            console.error("Error assigning task:", error);
            alert("Error assigning task. Please try again.");
        }
    };

    const handleTransferTask = async (taskId, assignedTo) => {
        try {
            const taskDocRef = doc(db, "allQueries", taskId);
            await updateDoc(taskDocRef, {
                assignedTo: assignedTo,
                acceptedBy: null,
            });
            alert(`Task transferred to ${assignedTo}`);
            fetchTasks();
        } catch (error) {
            console.error("Error transferring task:", error);
            alert("Error transferring task. Please try again.");
        }
    };
    const handleAcceptTask = async (taskId) => {
        try {
            const taskDocRef = doc(db, "allQueries", taskId);
            const taskSnapshot = await getDoc(taskDocRef);
            const taskData = taskSnapshot.data();
            const currentUserEmail = auth.currentUser?.email;

            if (taskData.assignedTo !== currentUserEmail) {
                alert("You are not assigned to this task.");
                return;
            }

            await updateDoc(taskDocRef, {
                acceptedBy: currentUserEmail,
            });

            const updatedTaskSnapshot = await getDoc(taskDocRef);
            const updatedTaskData = updatedTaskSnapshot.data();
            const updatedTasks = tasks.map((task) =>
                task.id === taskId ? { ...task, ...updatedTaskData } : task
            );
            setTasks(updatedTasks);

        } catch (error) {
            console.error("Error accepting task:", error);
            alert("Error accepting task. Please try again.");
        }
    };




    useEffect(() => {
        fetchTasks();
    }, [taskAccepted]);

    const isAdmin = auth.currentUser?.email === "linktothedeveloper@gmail.com";
    const isUser = !isAdmin && auth.currentUser?.email !== "linktothedeveloper@gmail.com";
    const isTaskAcceptedByCurrentUser = (taskId) => acceptedTasks.includes(taskId);

    return (
        <div className='flex w-fit xl:w-full'>
            {isAdmin && (
                <form className="w-full max-w-lg ml-3 mt-6">
                    <div className="flex items-center mb-6">
                        <div className="w-1/3">
                            <label className="block text-black font-bold text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
                                Priority
                            </label>
                        </div>
                        <div className="w-2/3">
                            <select
                                onChange={(e) => { setPriority(e.target.value) }}
                                value={Priority}
                                className="bg-white appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-black leading-tight focus:outline-none focus:bg-white focus:border-blue-500 rounded-md pl-8"
                                id="grid-state"
                            >
                                <option></option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>
                    {/* Add other form fields for Task, Due Date, and Description */}
                    <div className="flex items-center mb-6">
                        <div className="w-1/3">
                            <label className="block text-black font-bold text-right mb-1 md:mb-0 pr-4" htmlFor="inline-password">
                                Task
                            </label>
                        </div>
                        <div className="w-2/3">
                            <input
                                onChange={(e) => { setTask(e.target.value) }}
                                value={Task} required
                                className="bg-white appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-black leading-tight focus:outline-none rounded-md"
                                id="inline-password"
                            />
                        </div>
                    </div>
                    <div className="flex items-center mb-6">
                        <div className="w-1/3">
                            <label className="block text-black font-bold text-right mb-1 md:mb-0 pr-4" htmlFor="inline-password">
                                Due Date
                            </label>
                        </div>
                        <div className="w-2/3">
                            <input
                                onChange={(e) => { setdescription(e.target.value) }}
                                value={description} required
                                className="bg-white appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-black leading-tight focus:outline-none rounded-md"
                                type='date'
                                id="inline-password"
                            />
                        </div>
                    </div>
                    <div className="flex items-center mb-4">
                        <div className="w-1/3">
                            <label className="block text-black font-bold text-right mb-1 md:mb-0 pr-4" htmlFor="inline-password">
                                Description
                            </label>
                        </div>
                        <div className="w-2/3">
                            <textarea
                                onChange={(e) => { setdescription(e.target.value) }}
                                value={description}
                                className="rounded-md resize-none border-2 border-gray-200 focus:border-blue-500 w-full h-40 py-2 px-4 text-black leading-tight focus:outline-none"
                                id="description"
                            />
                        </div>
                    </div>

                    <div className="flex items-center mb-4">
                        <div className="w-1/3">
                            <label className="block text-black font-bold text-right mb-1 md:mb-0 pr-4" htmlFor="inline-password">
                                Assign To
                            </label>
                        </div>
                        <div className="w-2/3">
                            <input
                                onChange={(e) => { setAssignedTo(e.target.value) }}
                                value={assignedTo}
                                className="bg-white appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-black leading-tight focus:outline-none rounded-md"
                                id="inline-password"
                                placeholder="Enter the email to assign the task"
                            />
                        </div>
                    </div>


                    <div className="flex items-center mb-4">
                        <div className="w-2/3">
                            <button
                                onClick={submitQuery}
                                className="shadow bg-blue-500 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-3 rounded"
                                type="button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Assigning...' : 'Assign Task'}
                            </button>


                        </div>
                    </div>
                </form>
            )}

            <TaskCard
                tasks={tasks}
                currentUserEmail={currentUserEmail}
                isAdmin={isAdmin}
                handleAcceptTask={handleAcceptTask}
                handleTransferTask={handleTransferTask}
            />
        </div>
    );
};

export default TwoColumnLayout;
