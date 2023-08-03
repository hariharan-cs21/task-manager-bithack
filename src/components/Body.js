import React, { useEffect, useState } from 'react';
import TwoColumnLayout from './TwoColumnLayout';
import { auth, db } from "../components/Config/firebaseconfig";
import { useNavigate } from 'react-router-dom';
import NotificationBar from './Notify';
import { updateDoc, doc, getDocs, collection } from 'firebase/firestore';


const Body = ({ isloggedIn }) => {
    const [userDisplayName, setUserDisplayName] = useState('');
    const [tasks, setTasks] = useState([]);
    const [taskAccepted, setTaskAccepted] = useState(false);
    const currentUserEmail = auth.currentUser?.email || '';
    const isDeveloperEmail = currentUserEmail === 'linktothedeveloper@gmail.com';
    const isUser = !isDeveloperEmail && currentUserEmail !== 'linktothedeveloper@gmail.com';
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

    return (
        <>
            {isloggedIn && <p style={{ fontSize: "0.8rem" }} className='flex items-center ml-auto mr-1 flex-col'>Welcome {userDisplayName}</p>}
            <div className="overflow-auto flex-1">
                {/* Include the NotificationBar component */}
                <NotificationBar tasks={tasks} currentUserEmail={currentUserEmail} />

                {<TwoColumnLayout isloggedIn={isloggedIn} tasks={tasks} currentUserEmail={currentUserEmail} handleAcceptTask={handleAcceptTask} />}
            </div>
        </>
    );
};

export default Body;
