import { signOut } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './Config/firebaseconfig';
import colab from "./colab.gif";
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import CollobTask from "./CollobTask";
import Notebook from './Notebook';
import emailjs from '@emailjs/browser';

const Collaboration = ({ user, setloggedIn }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const isadmin = "linktothedeveloper@gmail.com";

    let navigate = useNavigate();
    const LogutUser = () => {
        signOut(auth).then(() => {
            localStorage.clear();
            setloggedIn(false);
            setIsDropdownOpen(false);
            navigate("/");
        });
    };

    const handleProfile = () => {
        navigate("/profile");
    };
    const [showForm, setShowForm] = useState(false);
    const [unShowForm, setUnShowForm] = useState(true);
    const [showNotebook, setShowNotebook] = useState(false);

    const onFormClick = () => {
        setShowForm(true);
        setUnShowForm(false);
        setShowNotebook(false);
    };

    const onUnformClick = () => {
        setShowForm(false);
        setUnShowForm(true);
        setShowNotebook(true);
    };

    const [Priority, setPriority] = useState("");
    const [assignedTo, setAssignedTo] = useState([]);
    const [Task, setTask] = useState("");
    const [description, setDescription] = useState("");
    const [taskAccepted, setTaskAccepted] = useState(false);
    const [dueDate, setDueDate] = useState("");

    const [usersData, setUsersData] = useState([]);
    const usersCollection = collection(db, 'users');

    const filteredUsersData = usersData.filter(userData => userData.email !== isadmin);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(usersCollection);
            const userData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsersData(userData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const onDeleteTask = (taskId) => {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
    };

    const submitTask = async () => {
        if (Priority && Task && description && assignedTo.length > 0 && dueDate) {
            try {
                const queryPerson = {
                    name: auth.currentUser.displayName,
                    id: auth.currentUser.uid,
                    email: auth.currentUser.email,
                };

                const assignedUsers = assignedTo.map((email) => {
                    const user = usersData.find((userData) => userData.email === email);
                    return { name: user.name, email: user.email };
                });

                const collabTask = {
                    Priority,
                    Task,
                    status: 'pending',
                    description,
                    assignedTo: assignedUsers,
                    dueDate,
                    queryPerson,
                    completed: false,
                    subtasks: [],
                };

                const taskCollection = collection(db, 'collobTasks');
                await addDoc(taskCollection, collabTask);

                const emailParams = {
                    subject: 'New Task Assigned in Collaboration',
                    message: `
            Priority: ${Priority}
            You have been assigned a new task: ${Task}
            Due Date : ${dueDate}
            
            Collaborators: ${assignedTo.map(email => {
                        const user = usersData.find(userData => userData.email === email);
                        return user ? user.name : email;
                    }).join(', ')}
            
            Visit the site for more details.
          `,
                };

                for (const email of assignedTo) {
                    emailParams.to_email = email;

                    try {
                        await emailjs.send('service_eavgtrc', 'template_0dnmf4f', emailParams, 'rfs9ncfRYsufYCkcL');
                        console.log(`Email sent to ${email}`);
                    } catch (error) {
                        console.error(`Error sending email to ${email}:`, error);
                    }
                }

                alert('Task has been submitted successfully.');
                setPriority('');
                setTask('');
                setDescription('');
                setAssignedTo([]);
                setDueDate('');
                setTaskAccepted(true);
            } catch (error) {
                console.error('Error submitting task:', error);
            }
        } else {
            alert('Please fill in all the fields, including Assign To and Due Date.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            const tasksQuery = query(collection(db, 'collobTasks'));
            const querySnapshot = await getDocs(tasksQuery);
            const taskData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setTasks(taskData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const [domains, setDomains] = useState([]);
    const [newDomain, setNewDomain] = useState('');
    const [selectedCollaborators, setSelectedCollaborators] = useState([]);

    const addNewDomain = async () => {
        if (newDomain) {
            try {
                const domainCollection = collection(db, 'domains');
                const domainDoc = await addDoc(domainCollection, { name: newDomain, collaborators: selectedCollaborators });

                setNewDomain('');
                await fetchDomains();
                alert("Domain Added")
            } catch (error) {
                console.error('Error adding domain:', error);
            }
        } else {
            alert('Please enter a domain name.');
        }
    };

    const fetchDomains = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'domains'));
            const domainData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setDomains(domainData);
        } catch (error) {
            console.error('Error fetching domains:', error);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const [showPopup1, setShowPopup1] = useState(false)
    const openPopup1 = () => {
        setShowPopup1(true);
    };

    const closePopup1 = () => {
        setShowPopup1(false);
    };
    return (
        <div>
            <nav className="bg-white p-4">
                <div className="flex items-center justify-between">
                    <div className='flex items-center'>
                        <h1 className="text-xl font-semibold ml-6">Task Collaboration</h1>
                        <img
                            src={colab}
                            alt='colab'
                            className='h-10 w-10 hidden sm:block'
                        />
                    </div>

                    <div className="flex items-center">
                        <p>{user?.displayName}</p>
                        <img
                            src={user?.photoURL}
                            alt="Profile"
                            width="32px"
                            height="32px"
                            className="rounded-full mr-2 ml-2 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown();
                            }}
                        />
                        {isDropdownOpen && (
                            <div className="absolute  right-0 mt-14 p-2 mr-3 w-40 bg-white hover:bg-blue-100 rounded-md shadow-lg">
                                <option className="hover:bg-blue-200 rounded-md" style={{ cursor: "pointer" }} onClick={handleProfile}>
                                    View Profile
                                </option>
                                <option className="hover:bg-blue-200 rounded-md" style={{ cursor: "pointer" }} onClick={LogutUser}>
                                    Logout
                                </option>
                            </div>
                        )}
                    </div>
                </div>
            </nav>


            <div className='flex flex-col md:flex-row gap-10'>
                <div className='md:w-1/2 overflow-y-auto '>
                    <div className='p-6 rounded-lg' style={{ maxHeight: '85vh', overflowY: "scroll" }}>
                        {tasks.length > 0 && (
                            <div>
                                {user?.email === isadmin ? (
                                    tasks.map((task) => (
                                        <div key={task.id}>
                                            <CollobTask task={task} tasks={tasks} isadmin={isadmin} isAssignedUser={false} onDeleteTask={onDeleteTask} />
                                        </div>
                                    ))
                                ) : (
                                    tasks
                                        .filter((task) => task.assignedTo.some((collaborator) => collaborator.email === user?.email))
                                        .map((task) => (
                                            <div key={task.id}>
                                                <CollobTask task={task} tasks={tasks} isadmin={isadmin} isAssignedUser={true} onDeleteTask={onDeleteTask} />
                                            </div>
                                        ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {(auth.currentUser?.email !== isadmin) && (
                    <div className="p-6 shadow-md rounded-lg bg-white mt-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        <Notebook user={user} />
                    </div>
                )}

                {user?.email === isadmin && (
                    <div className='md:w-1/2'>
                        <div className='md:flex md:flex-col'>

                            <div>
                                {unShowForm ? (
                                    <>
                                        <button onClick={openPopup1} className='bg-gray-800 rounded-md p-2 top-1 text-white w-32 mb-2 mr-2'>Add Domain</button>

                                        <button onClick={onFormClick} className='bg-gray-800 rounded-md p-2 top-1 text-white w-24'>Add Task</button>
                                    </>
                                ) : (
                                    <button className='w-24 bg-gray-800 rounded-md p-2 text-white' onClick={onUnformClick}>Close</button>
                                )}
                                {showForm && (
                                    <div className="p-6 shadow-md rounded-lg bg-white mt-4" style={{ maxHeight: "78vh", overflowY: "auto" }}>
                                        <form className="space-y-4">
                                            <div className="flex flex-col">
                                                <label htmlFor="title" className="text-sm font-medium mb-1 text-gray-600">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                                                    value={Task}
                                                    onChange={(e) => setTask(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="description" className="text-sm font-medium mb-1 text-gray-600">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                                                    rows="2"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="dueDate" className="font-medium mb-1">
                                                    Due Date
                                                </label>
                                                <input
                                                    type="date"
                                                    id="dueDate"
                                                    className="rounded-lg border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                                                    value={dueDate}
                                                    onChange={(e) => setDueDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="priority" className="font-medium mb-1">
                                                    Priority
                                                </label>
                                                <select
                                                    id="priority"
                                                    className="rounded-lg border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                                                    value={Priority}
                                                    onChange={(e) => setPriority(e.target.value)}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="collaborators" className="font-medium mb-1">
                                                    Collaborators
                                                </label>
                                                <select
                                                    id="collaborators"
                                                    className="rounded-lg h-40 border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                                                    multiple
                                                    value={assignedTo}
                                                    onChange={(e) => {
                                                        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                                                        setAssignedTo(selectedOptions);
                                                    }}
                                                >
                                                    {domains.map((domain) => (
                                                        <optgroup key={domain.id} label={domain.name} className='bg-white rounded-lg p-2'>
                                                            {domain.collaborators.map((email) => (
                                                                <option key={email} value={email} className='rounded-lg w-3/4 m-1 border border-blue-500'>
                                                                    {email}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>

                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                                    onClick={submitTask}
                                                    type="button"
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                                {!showForm &&
                                    <div>
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-4"
                                            onClick={() => setShowNotebook(!showNotebook)}
                                        >
                                            {showNotebook ? 'Close Notebook' : 'Open Notebook'}
                                        </button>
                                        {showNotebook && (
                                            <div className="p-6 shadow-md rounded-lg bg-white mt-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                                                <Notebook user={user} />
                                            </div>
                                        )}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                )}

            </div>
            {user?.email === isadmin && showPopup1 &&
                < div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
                        <h2 className="text-lg font-semibold mb-4">Manage Domains</h2>
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col">
                                <label htmlFor="newDomain" className="text-sm font-medium mb-1 text-gray-600">
                                    Create New Domain
                                </label>
                                <input
                                    type="text"
                                    id="newDomain"
                                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="collaborators" className="text-sm font-medium mb-1 text-gray-600">
                                    Select Collaborators
                                </label>
                                <select
                                    id="collaborators"
                                    className="rounded-lg border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                                    multiple
                                    value={selectedCollaborators}
                                    onChange={(e) => {
                                        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                                        setSelectedCollaborators(selectedOptions);
                                    }}
                                >
                                    {filteredUsersData.map((userData) => (
                                        <option key={userData.id} value={userData.email}>
                                            {userData.name} : {userData.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                                    onClick={addNewDomain}
                                    type="button"
                                >
                                    Create Domain
                                </button>
                                <button className="ml-2 text-gray-600 hover:text-blue-600" onClick={closePopup1}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            }
        </div >
    );
};

export default Collaboration;
