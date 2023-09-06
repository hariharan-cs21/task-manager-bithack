import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './Config/firebaseconfig';
import ToastWithCloseButton from './toast';
import '../App.css'
import Music from './Music';
import PersonalNotify from './PersonalNotify';
import Calendar from 'react-calendar';
import SmallComponent from './SmallCompnent';
import { useSpring, animated, config, useTrail } from 'react-spring';

const PersonalTaskCard = ({ user }) => {
    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [startDate, setstartDate] = useState("")

    const [category, setCategory] = useState("")
    const [showBar, setShowBar] = useState(false)
    const [showNotificationBar, setshowNotificationBar] = useState(false)
    const [showLayout, setshowLayout] = useState(false)

    const [tasks, setTasks] = useState([]);

    const [searchKeyword, setSearchKeyword] = useState('');

    const handleNotification = () => {
        setshowNotificationBar(true)
        setshowLayout(false)
    }


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
    const calculateTimeRemaining = (dueDate) => {
        if (!dueDate) {
            return "Due date not provided";
        }

        const now = new Date();
        const due = new Date(dueDate);

        if (isNaN(due)) {
            return "Invalid date provided";
        }

        const timeDiff = due - now;

        if (timeDiff <= 0) {
            return "Time ended";
        }

        const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        return `${daysRemaining}d : ${hoursRemaining}h : ${minutesRemaining}m `;
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
    const [tasksWithDueDate, setTasksWithDueDate] = useState([]);


    const fetchTasks = async () => {
        try {
            const querySnapshot = await getDocs(personaltasks);
            const tasksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            const tasksWithDue = tasksData.filter((task) => task.dueDate);

            setTasksWithDueDate(tasksWithDue);
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
    function formatDate(date) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    useEffect(() => {
        fetchTasks();
        setshowNotificationBar(false)
        setshowLayout(true)
    }, []);


    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setShowBar(false);
        }, 4000);
        return () => clearTimeout(timeoutId);
    }, [showBar])

    const [showCalendar, setShowCalendar] = useState(false);

    const openCalendar = () => {
        setShowCalendar(true);
    };

    const closeCalendar = () => {
        setShowCalendar(false);
    };

    const [showPopup1, setShowPopup1] = useState(false);
    const [showPopup2, setShowPopup2] = useState(false);
    const openPopup2 = () => {
        setShowPopup2(true);
    };

    const closePopup2 = () => {
        setShowPopup2(false);
    };

    const openPopup1 = () => {
        setShowPopup1(true);
    };

    const closePopup1 = () => {
        setShowPopup1(false);
    };

    const buttonConfig = [
        { name: <div><i className="uil uil-plus mr-1"></i>Add Task</div>, onClick: openAddTaskModal },
        { name: <div><i className="uil uil-calender text-xl mr-1"></i>Calendar</div>, onClick: openCalendar },
        { name: <div><i className="uil uil-wordpress-simple text-xl"></i>Daily Quotes</div>, onClick: openPopup2 },

        { name: 'Button', onClick: openPopup1 },
    ];
    const buttonSprings = useTrail(buttonConfig.length, {
        opacity: 1,
        transform: 'translateX(0px)',
        config: config.stiff,
        from: { opacity: 0, transform: 'translateX(100px)' },
    });
    const [showPopup, setShowPopup] = useState(false);

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };
    const popupAnimation = useSpring({
        from: { opacity: 0, transform: 'scale(0.8)' },
        to: { opacity: 1, transform: 'scale(1)' },
    });

    return (

        <div className="flex flex-col h-screen bg-blue-50" >
            <div className='grid-1'>
                <nav className="text-blue-800 p-2 bg-white">
                    <div className="flex justify-between items-center">


                        <div className="flex items-center space-x-1 cursor-pointer  hover:bg-blue-700 p-1 rounded-xl hover:text-white" onClick={() => navigate('/dashboard')}>
                            <i className="uil uil-estate text-xl"></i>
                            <p className="font-bold text-lg">Home</p>
                        </div>
                        <div className="relative w-2/5 ml-8">
                            <div className='flex justify-between items-center'>
                                <input
                                    type="text"
                                    className="w-full pl-2 py-1 rounded-xl text-black border-blue-700 border focus:outline-none focus:border-blue-500"
                                    placeholder="Search Tasks..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    required
                                />

                            </div>

                        </div>

                        <div className="flex items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105" >
                            <div className='cursor-pointer flex items-center text-black hover:bg-blue-700 p-1 px-1 rounded-xl hover:text-white font-bold text-blue-700 mr-2' onClick={handleNotification}>
                                <i className="uil uil-bell text-2xl"></i>
                            </div>
                            <img
                                src={user?.photoURL}
                                className="w-10 h-10 rounded-full border-2 border-white"
                                alt="avatar"
                                onClick={() => navigate('/profile')}
                            />
                        </div>

                    </div>

                </nav>
                <Music />

                <div className="flex justify-end mx-6 my-4">

                    <button
                        className="ml-2  bg-blue-700 hover:bg-blue-600 text-white px-2 py-2 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={togglePopup}
                    >
                        {showPopup ? 'Close ' : 'Show Tools'}
                    </button>

                    {showPopup && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                            <animated.div
                                className="bg-white rounded-lg shadow-lg p-6 w-5/12"
                                style={popupAnimation}
                            >
                                <div className="flex">
                                    <div className="flex flex-col">
                                        {buttonSprings.map((props, index) => (
                                            <animated.button
                                                key={index}
                                                className="h-10 bg-blue-700 hover:bg-blue-600 text-white rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                                style={{
                                                    ...props,
                                                    marginBottom: '8px',
                                                    width: '140px',
                                                    height: '70px',
                                                }}
                                                onClick={buttonConfig[index].onClick}
                                            >
                                                {buttonConfig[index].name}
                                            </animated.button>
                                        ))}
                                    </div>

                                    <div className="flex ml-4 mb-2">
                                        <div className="mr-4 p-7 rounded-lg bg-white shadow-md " >
                                            <h2 className="text-sm font-semibold text-gray-800 mb-4 cursor-pointer" onClick={(openAddTaskModal)}>Add and Manage your Tasks</h2>
                                            <div className="mt-12 cursor-pointer" onClick={(openCalendar)}>
                                                <h2 className="text-sm font-semibold text-blue-600">View important dates and Tasks</h2>
                                            </div>
                                            <div className="mt-12 cursor-pointer">
                                                <h2 className="text-sm font-semibold text-green-600" onClick={openPopup2}>Motivational Quotes</h2>
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-semibold text-purple-600 mt-12">New Field</h2>
                                            </div>
                                        </div>

                                        <button
                                            className="h-10 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                            onClick={togglePopup}
                                        >
                                            Close
                                        </button>
                                    </div>

                                </div>

                            </animated.div>

                        </div>
                    )}

                </div>
                {
                    showPopup1 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
                                <button className="ml-2 text-gray-600 hover:text-blue-600" onClick={closePopup1}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                }

                {
                    showPopup2 && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 ">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
                                <SmallComponent />
                                <button className="ml-2 text-gray-600 hover:text-blue-600" onClick={closePopup2}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                }
                {showBar && <ToastWithCloseButton title={title} />}

                {
                    showNotificationBar && <PersonalNotify
                        setshowLayout={setshowLayout}
                        showNotificationBar={showNotificationBar}
                        setshowNotificationBar={setshowNotificationBar}
                        tasks={tasks} />
                }

                {
                    showLayout &&
                    <>
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
                                        <div key={index} className={`bg-white rounded-xl text-black shadow-md p-5 ${task.completed ? 'line-through text-gray-600' : ''}`}>

                                            <>
                                                <div className='flex justify-between'>
                                                    <h2 className="text-xl font-bold mb-2">{task.title}</h2>
                                                    {task.dueDate && (
                                                        <p className="text-sm font-bold text-black">
                                                            Due: {formatDate(new Date(task.dueDate))}
                                                        </p>
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
                                                    <p className="mt-2 text-sm text-gray-600">Start: {formatDate(new Date(task.startDate))}</p>
                                                )}

                                                {task.dueDate && (
                                                    <p className='text-sm'>
                                                        Time left: {calculateTimeRemaining(task.dueDate)}
                                                    </p>
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
                    </>
                }
                {
                    showCalendar && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
                                <div className="w-full rounded-lg">
                                    <Calendar
                                        value={new Date()}
                                        className="bg-white rounded-lg shadow-md"
                                        tileClassName={({ date }) => {
                                            const dueDatesForCurrentUser = tasksWithDueDate.filter((task) =>
                                                new Date(task.dueDate).toDateString() === date.toDateString() &&
                                                task.queryPerson.id === auth.currentUser?.uid &&
                                                !task.deleted
                                            );

                                            return dueDatesForCurrentUser.length > 0
                                                ? "bg-blue-500 text-white rounded-lg"
                                                : "";
                                        }}
                                        tileContent={({ date }) => {
                                            const dueDatesForCurrentUser = tasksWithDueDate.filter((task) =>
                                                new Date(task.dueDate).toDateString() === date.toDateString() &&
                                                task.queryPerson.id === auth.currentUser?.uid &&
                                                !task.deleted
                                            );

                                            if (dueDatesForCurrentUser.length > 0) {
                                                return (
                                                    <div className="flex flex-col space-y-2">
                                                        {dueDatesForCurrentUser.map((task) => (
                                                            <div
                                                                key={task.id}
                                                                className="bg-blue-500 text-white text-sm py-1 px-1 rounded-full"
                                                            >
                                                                {task.title}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}

                                    />

                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        className="ml-2 text-gray-600 hover:text-blue-600"
                                        onClick={closeCalendar}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    isAddingTask && (
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

                    )
                }

            </div >
            <div></div>
        </div >
    )
}


export default PersonalTaskCard