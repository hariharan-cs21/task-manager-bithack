import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './Config/firebaseconfig';
import ToastWithCloseButton from './toast';
import '../App.css'

const PersonalTaskCard = ({ user }) => {
    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [startDate, setstartDate] = useState("")

    const [category, setCategory] = useState("")
    const [showBar, setShowBar] = useState(false)

    const [tasks, setTasks] = useState([]);

    const [searchKeyword, setSearchKeyword] = useState('');

    const sortTasks = (criterion) => {
        const sortedTasks = [...tasks].sort((a, b) => {
            if (criterion === 'priority') {
                const priorityValues = { high: 1, medium: 2, low: 3 };
                return priorityValues[a[criterion]] - priorityValues[b[criterion]];
            } else {
                if (a[criterion] < b[criterion]) return -1;
                if (a[criterion] > b[criterion]) return 1;
                return 0;
            }
        });
        setTasks(sortedTasks);
    };

    const calculateTimeRemaining = (startDate, dueDate) => {
        const start = new Date(startDate);
        const due = new Date(dueDate);

        const timeDiff = due - start;

        if (timeDiff <= 0) {
            return "Time ended";
        }

        const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        let remainingTime = `${daysRemaining} days ${hoursRemaining} hours`;

        if (daysRemaining === 0 && hoursRemaining < 24) {
            remainingTime += ` (Less than 24 hours)`;
        }

        return remainingTime;
    };



    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.description.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    const userTasks = tasks.filter(
        task => task.queryPerson.id === auth.currentUser?.uid
    );

    const userCompletedTasks = userTasks.filter(task => task.completed);

    const userProgress = (userCompletedTasks.length / userTasks.length) * 100;


    const [isAddingTask, setIsAddingTask] = useState(false);

    const openAddTaskModal = () => {
        setIsAddingTask(true);
    };

    const closeAddTaskModal = () => {
        setIsAddingTask(false);
        setDescription("")
        setCategory("")
        setDueDate("")
        setstartDate("")
        setPriority("")
    };

    const personaltasks = collection(db, "mypersonal");

    const addNewTask = async () => {
        try {
            const queryPerson = {
                name: auth.currentUser.displayName,
                id: auth.currentUser.uid,
                email: auth.currentUser.email,
            };
            const newTask = {
                title: title, description: description, category: category, priority: priority, dueDate:
                    dueDate, startDate: startDate, queryPerson
            }
            await addDoc(personaltasks, newTask);
            setTasks([...tasks, newTask]);

            setShowBar(true)
            setDescription("")
            setCategory("")
            setDueDate("")
            setstartDate("")
            setPriority("")
            closeAddTaskModal();
        } catch (error) {
            console.error('Error adding task', error);
        }

    };

    const fetchTasks = async () => {
        try {
            const querySnapshot = await getDocs(personaltasks);
            const tasksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setTasks(tasksData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };



    const editTask = async (index, updatedTask) => {
        try {
            const taskDocRef = doc(db, 'mypersonal', updatedTask.id);
            await updateDoc(taskDocRef, { completed: updatedTask.completed });

            const updatedTasks = [...tasks];
            updatedTasks[index] = updatedTask;
            setTasks(updatedTasks);
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Error updating task. Please try again.');
        }
    };


    const handleDeleteTask = async (index, taskId) => {
        try {
            const taskDocRef = doc(db, "mypersonal", taskId);
            await deleteDoc(taskDocRef);
            const updatedTasks = [];
            for (let i = 0; i < tasks.length; i++) {
                if (i !== index) {
                    updatedTasks.push(tasks[i]);
                }
            }
            setTasks(updatedTasks);
            alert("Task deleted");
            fetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Error deleting task. Please try again.");
        }
    };
    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setShowBar(false);
        }, 4000);
        return () => clearTimeout(timeoutId);
    }, [showBar])

    return (

        <div className="flex flex-col h-screen bg-blue-50" >
            <nav className="text-blue-800 p-2 bg-white">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1 cursor-pointer  hover:bg-blue-700 p-1 rounded-xl hover:text-white" onClick={() => navigate('/dashboard')}>
                        <i className="uil uil-home text-xl"></i>
                        <p className="font-bold text-lg">Home</p>
                    </div>
                    <div className="relative w-1/3">
                        <input
                            type="text"
                            className="w-full pl-2 py-1 rounded-xl text-black border-blue-700 border focus:outline-none focus:border-blue-500"
                            placeholder="Search Tasks..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105" onClick={() => navigate('/profile')}>
                        <img
                            src={user?.photoURL}
                            className="w-10 h-10 rounded-full border-2 border-white"
                            alt="avatar"
                        />
                    </div>
                </div>
            </nav>

            <div className="flex justify-end mx-6 my-4">

                <button
                    className="ml-2 h-12 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    onClick={openAddTaskModal}
                >
                    Add Task
                </button>
                {showBar && <ToastWithCloseButton title={title} />}


            </div>
            <div className="flex justify-between mx-6 mb-2">
                <div className="space-x-4">
                    <button className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none" onClick={() => sortTasks('dueDate')}>
                        Sort by Due Date
                    </button>
                    <button className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none" onClick={() => sortTasks('priority')}>
                        Sort by Priority
                    </button>

                </div>
                <div className="flex items-center">
                    <p className="text-sm text-gray-600 mr-2">
                        {userProgress.toFixed(1)}%
                    </p>
                    <div className="bg-gray-300 h-2 w-32 rounded-full">
                        <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${userProgress.toFixed(1)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-6 mb-12 scroll-smooth overflow-y-scroll">
                {filteredTasks.map((task, index) => (
                    <>
                        {
                            task.queryPerson.id === auth.currentUser?.uid &&
                            <div key={index} className={`bg-white rounded-xl shadow-md p-5 ${task.completed ? 'opacity-50' : ''}`}>

                                <>
                                    <div className='flex justify-between'>
                                        <h2 className="text-xl font-bold mb-2">{task.title}</h2>
                                        {task.dueDate && (
                                            <p className=" text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-2">{task.description}</p>
                                    <div className="flex mt-2">
                                        <span className={`text-xs font-semibold py-1 px-2 rounded-full ${task.priority === 'high'
                                            ? 'bg-red-500 text-white'
                                            : task.priority === 'medium'
                                                ? 'bg-yellow-500 text-gray-900'
                                                : 'bg-green-500 text-white'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-xs font-semibold py-1 px-2 ml-2 bg-blue-500 text-white rounded-full">
                                            {task.category}
                                        </span>
                                    </div>
                                    {task.startDate && (
                                        <p className="mt-2 text-sm text-gray-600">Start: {new Date(task.startDate).toLocaleDateString()}</p>
                                    )}
                                    <p className='text-sm'>
                                        Time left
                                        : {calculateTimeRemaining(task.startDate, task.dueDate)}
                                    </p>

                                    <div className="mt-4">
                                        <button
                                            className={`mr-2 px-2 py-1 rounded ${task.completed
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-300 text-gray-600 hover:bg-blue-600 hover:text-white'
                                                }`}
                                            onClick={() => editTask(index, { ...task, completed: !task.completed })}
                                        >
                                            {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                        </button>

                                        <button
                                            className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500"
                                            onClick={() => handleDeleteTask(index, task.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>

                            </div>
                        }
                    </>
                ))}
            </div>


            {isAddingTask && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <div className="mb-2">
                            <label className="block font-medium text-sm mb-1">Title:</label>
                            <input
                                className="w-full border border-gray-300 rounded-md p-2"
                                type="text"
                                name="title"
                                value={title}
                                onChange={(e) => { setTitle(e.target.value) }}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-sm mb-1">Description:</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md p-2"
                                name="description"
                                rows="3"
                                onChange={(e) => { setDescription(e.target.value) }}
                                value={description}
                            />

                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-sm mb-1">Priority:</label>
                            <select
                                className="w-full border border-gray-300 rounded-md p-2"
                                name="priority"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                <option value=""></option>

                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-sm mb-1">Category:</label>
                            <input
                                className="w-full border border-gray-300 rounded-md p-2"
                                type="text"
                                name="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-sm mb-1">Start Date:</label>
                            <input
                                className="w-full border border-gray-300 rounded-md p-2"
                                type="date"
                                name="dueDate"
                                onChange={(e) => { setstartDate(e.target.value) }}
                                value={startDate}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-sm mb-1">Due Date:</label>
                            <input
                                className="w-full border border-gray-300 rounded-md p-2"
                                type="date"
                                name="dueDate"
                                onChange={(e) => { setDueDate(e.target.value) }}
                                value={dueDate}
                            />
                        </div>




                        <div className="flex justify-end">
                            <button
                                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={addNewTask}
                            >
                                Add
                            </button>
                            <button
                                className="ml-2 text-gray-600 hover:text-blue-600"
                                onClick={closeAddTaskModal}
                            >
                                Cancel
                            </button>
                        </div>

                    </div>

                </div>

            )}


        </div>
    )
}


export default PersonalTaskCard