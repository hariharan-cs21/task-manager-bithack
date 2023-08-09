import React, { useEffect, useState } from 'react';
import TwoColumnLayout from './TwoColumnLayout';
import { auth, db } from "../components/Config/firebaseconfig";
import { useNavigate } from 'react-router-dom';
import NotificationBar from './Notify';
import { updateDoc, doc, getDocs, collection } from 'firebase/firestore';


const Body = ({ isloggedIn, user }) => {
    const [userDisplayName, setUserDisplayName] = useState('');
    const [tasks, setTasks] = useState([]);
    const [taskAccepted, setTaskAccepted] = useState(false);
    const currentUserEmail = auth.currentUser?.email || '';
    const navigate = useNavigate();

    useEffect(() => {
        if (!isloggedIn) {
            navigate('/');
        } else {
            setUserDisplayName(auth.currentUser?.displayName || '');
        }
    }, [isloggedIn]);

    useEffect(() => {
        fetchTasks();
    }, [taskAccepted]);

    const fetchTasks = async () => {
        const queryCollection = collection(db, 'allQueries');
        try {
            const querySnapshot = await getDocs(queryCollection);
            const tasksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setTasks(tasksData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };
    const [showNotificationBar, setShowNotificationBar] = useState(false);
    const [showLayout, setShowLayout] = useState(true);


    const handleAcceptTask = async (taskId) => {
        try {
            const taskDocRef = doc(db, 'allQueries', taskId);
            await updateDoc(taskDocRef, {
                acceptedBy: currentUserEmail,
            });
            setTaskAccepted((prev) => !prev);
            alert('Task accepted successfully.');
        } catch (error) {
            console.error('Error accepting task:', error);
            alert('Error accepting task. Please try again.');
        }
    };
    const handleShowNotificationBar = () => {
        setShowNotificationBar(true);
        setShowLayout(false)
    };
    const handleLayout = () => {
        setShowNotificationBar(false);
        setShowLayout(true)
    };

    return (
        <>
            <div className='flex items-center justify-end'>
                <i className="uil uil-bell text-2xl text-green-500 ml-auto hover:decoration-blue-400" onClick={handleShowNotificationBar}></i>

                {isloggedIn && <p className='ml-1 text-sm mr-3'>Welcome {user?.displayName}</p>}
            </div>
            {showNotificationBar && <button className="shadow bg-blue-500 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-3 rounded m-auto" onClick={handleLayout}>View Dashboard</button>}
            <div className="overflow-auto flex-1">

                {showNotificationBar && <NotificationBar tasks={tasks} currentUserEmail={currentUserEmail} />}

                {showLayout && <TwoColumnLayout isloggedIn={isloggedIn} tasks={tasks} currentUserEmail={currentUserEmail} handleAcceptTask={handleAcceptTask} />}
            </div>
        </>

    );
};

export default Body;
