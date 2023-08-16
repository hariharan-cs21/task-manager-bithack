import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from './Config/firebaseconfig';

const PersonalTaskCard = ({ user }) => {
    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [category, setCategory] = useState("")


    const [tasks, setTasks] = useState([]);

    const [searchKeyword, setSearchKeyword] = useState('');

    const sortTasks = (criterion) => {
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a[criterion] < b[criterion]) return -1;
            if (a[criterion] > b[criterion]) return 1;
            return 0;
        });
        setTasks(sortedTasks);
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
    const [newTaskDetails, setNewTaskDetails] = useState({
        title: '',
        description: '',
        priority: '',
        category: 'general',
        dueDate: null,
        completed: false,
    });

    const openAddTaskModal = () => {
        setIsAddingTask(true);
    };

    const closeAddTaskModal = () => {
        setIsAddingTask(false);
        setNewTaskDetails({
            title: '',
            description: '',
            priority: 'low',
            category: 'general',
            dueDate: null,
            completed: false,
        });
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
                    dueDate, queryPerson
            }
            await addDoc(personaltasks, newTask);
            setTasks([...tasks, newTask]);
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



    const editTask = (index, updatedTask) => {
        const updatedTasks = [...tasks];
        updatedTasks[index] = updatedTask;
        setTasks(updatedTasks);
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
                    className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    onClick={openAddTaskModal}
                >
                    Add Task
                </button>
            </div>

            <div className="flex justify-between mx-6 mb-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-6 mb-12">
                {filteredTasks.map((task, index) => (
                    <>
                        {
                            task.queryPerson.id === auth.currentUser?.uid &&
                            <div key={index} className={`bg-white rounded-xl shadow-md p-5 ${task.completed ? 'opacity-50' : ''}`}>

                                <>
                                    <h2 className="text-xl font-bold mb-2">{task.title}</h2>
                                    <p className="text-gray-600 mb-4">{task.description}</p>
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
                                    {task.dueDate && (
                                        <p className="mt-2 text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                    )}
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
                        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
                        <div className="mb-4">
                            <label className="block font-medium text-sm mb-1">Title:</label>
                            <input
                                className="w-full border border-gray-300 rounded-md p-2"
                                type="text"
                                name="title"
                                value={title}
                                onChange={(e) => { setTitle(e.target.value) }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium text-sm mb-1">Description:</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md p-2"
                                name="description"
                                rows="3"
                                onChange={(e) => { setDescription(e.target.value) }}
                                value={description}
                            />

                        </div>
                        <div className="mb-4">
                            <label className="block font-medium text-sm mb-1">Priority:</label>
                            <select
                                className="w-full border border-gray-300 rounded-md p-2"
                                name="priority"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium text-sm mb-1">Category:</label>
                            <input
                                className="w-full border border-gray-300 rounded-md p-2"
                                type="text"
                                name="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
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