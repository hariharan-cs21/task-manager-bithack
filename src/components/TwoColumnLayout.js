import React, { useState, useEffect } from 'react';
import { auth, db } from './Config/firebaseconfig';
import { collection, addDoc, getDocs, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import TaskCard from './TaskCard';
import Users from "./Users"
import calculateTimeRemaining from "./Utility/duedate"


const TwoColumnLayout = () => {
    const [Priority, setPriority] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const currentUserEmail = auth.currentUser?.email || "";

    const [Task, setTask] = useState("");
    const [description, setdescription] = useState("");
    const queryCollection = collection(db, "allQueries");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskAccepted, setTaskAccepted] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [dueDate, setDueDate] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [copiedUser, setCopiedUser] = useState("");


    const toggleForm = () => {
        setShowForm(!showForm);
    };


    const submitQuery = async () => {
        if (Priority && Task && description && assignedTo && dueDate) {
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
                    dueDate,
                    queryPerson,
                });
                alert("Uploaded");
                setPriority("");
                setTask("");
                setdescription("");
                setAssignedTo("");
                setDueDate("");
                setTaskAccepted(true);
            } catch (error) {
                console.error("Error submitting query:", error);
            }
            setIsSubmitting(false);
        } else {
            alert("Please fill in all the fields, including Assign To and Due Date.");
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
    }, []);


    useEffect(() => {
        setAssignedTo(copiedUser)
    }, [copiedUser])



    const handleDeleteTask = async (taskId) => {
        try {
            const taskDocRef = doc(db, "allQueries", taskId);
            await deleteDoc(taskDocRef);
            alert(`Task deleted`);
            fetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Error deleting task. Please try again.");
        }
    };

    const isAdmin = auth.currentUser?.email === "linktothedeveloper@gmail.com";
    return (
        <div className='flex flex-wrap justify-start lg:justify-start mr-4'>
            {isAdmin && (
                <>
                    <div className="flex items-start mb-2 flex-row-reverse">

                        <button
                            onClick={toggleForm}
                            className="shadow bg-blue-500 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-3 rounded"
                            type="button"
                        >
                            {showForm ? 'Assigned Task' : 'Add Task'}
                        </button>
                    </div>

                    {showForm ? (
                        <div className='flex w-5/6'>
                            {showForm &&
                                <div>
                                    <Users setCopiedUser={setCopiedUser} />
                                </div>
                            }
                            <form className="w-full max-w-lg mt-6">
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
                                            onChange={(e) => { setDueDate(e.target.value) }}
                                            value={dueDate} required
                                            className="bg-white appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-black leading-tight focus:outline-none rounded-md"
                                            type='date'
                                            id="due-date"
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
                                    {assignedTo &&
                                        <div className="w-2/3">
                                            <div className='bg-white rounded-lg'>
                                                <p className='p-1 ml-2'>{assignedTo}</p>
                                            </div>
                                        </div>
                                    }
                                </div>


                                <div className="flex items-center mb-4">
                                    <div className="w-2/3">
                                        <button
                                            onClick={submitQuery}
                                            className="shadow bg-blue-500 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-3 rounded mx-10"
                                            type="button"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Assigning...' : 'Assign Task'}
                                        </button>

                                    </div>

                                </div>
                            </form>
                        </div>


                    ) :
                        <div className="mb-3 mt-4 mx-auto w-[90%] md:w-[30%] lg:w-[30%] p-1 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg text-white text-center">
                            <h2 className="text-1xl md:text-2xl lg:text-2xl font-bold">Assigned Tasks</h2>
                        </div>

                    }
                </>
            )}

            <TaskCard
                tasks={tasks}
                currentUserEmail={currentUserEmail}
                isAdmin={isAdmin}
                handleAcceptTask={handleAcceptTask}
                calculateTimeRemaining={calculateTimeRemaining}
                handleTransferTask={handleTransferTask}
                handleDeleteTask={handleDeleteTask}

            />
        </div>
    );
};

export default TwoColumnLayout;
