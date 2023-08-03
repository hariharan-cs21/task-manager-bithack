import React, { useEffect, useState } from 'react';
import { db, auth } from './Config/firebaseconfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const TaskList = ({ currentUserEmail, handleTransferTask }) => {
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        const queryCollection = collection(db, "allQueries");
        try {
            const querySnapshot = await getDocs(queryCollection);
            const tasksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setTasks(tasksData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const isUser = auth.currentUser?.email !== "linktothedeveloper@gmail.com";

    const handleAcceptTask = async (taskId) => {
        try {
            const taskDocRef = doc(db, "allQueries", taskId);
            await updateDoc(taskDocRef, {
                acceptedBy: auth.currentUser?.email || "",
            });
            alert("Task accepted successfully.");
            fetchTasks();
        } catch (error) {
            console.error("Error accepting task:", error);
            alert("Error accepting task. Please try again.");
        }
    };

    return (
        <div>
            {tasks
                .filter((task) => task.assignedTo === currentUserEmail) // Filter tasks based on assigned email
                .map((task) => (
                    <div key={task.id} className="bg-white shadow-md p-4 mb-4 rounded-md">
                        <h2 className="text-lg font-semibold">{task.Task}</h2>
                        <p className="text-gray-600">{task.description}</p>
                        <p className="text-sm mt-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-md ${task.Priority === 'High' ? 'bg-red-500 text-white' : task.Priority === 'Medium' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'}`}>
                                {task.Priority}
                            </span>
                        </p>
                        {task.assignedTo && !task.acceptedBy && isUser && (
                            <button
                                className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded"
                                onClick={() => handleTransferTask(task.id, auth.currentUser?.email)}
                            >
                                Transfer Task
                            </button>
                        )}
                    </div>
                ))}
        </div>
    );
};

export default TaskList;
