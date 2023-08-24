import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getDocs,
    collection, getDoc, doc,
    serverTimestamp,
    addDoc,
    query,
    where,
} from 'firebase/firestore';
import { db, auth } from '../components/Config/firebaseconfig';

const Chat = ({ isloggedIn, user }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [hashtagGroups, setHashtagGroups] = useState([]);
    const [newGroup, setNewGroup] = useState('');
    const chatContainerRef = useRef(null);
    const navigate = useNavigate();
    const chatCollection = collection(db, 'chatCollection');
    const hashtagGroupsCollection = collection(db, 'hashtagGroupsCollection');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const sendMessage = async () => {
        if (message && selectedGroup) {
            try {
                const messageData = {
                    text: message,
                    sender: user.displayName,
                    senderId: user.uid,
                    groupId: selectedGroup,
                    timestamp: serverTimestamp(),
                };
                await addDoc(chatCollection, messageData);
                setMessage('');
                setMessages((prev) => [...prev, messageData])
                scrollToBottom()
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const createNewGroup = async () => {
        if (newGroup && isAdmin) {
            try {
                const groupData = {
                    name: newGroup,
                    members: [],
                };
                const newGroupRef = await addDoc(hashtagGroupsCollection, groupData);
                const newGroupId = newGroupRef.id;
                setHashtagGroups([...hashtagGroups, { id: newGroupId, ...groupData }]);
                setNewGroup('');
            } catch (error) {
                console.error('Error creating group:', error);
            }
        }
    };

    const fetchMessages = async () => {
        try {
            const q = query(
                chatCollection,
                where('groupId', '==', selectedGroup),
            );
            const querySnapshot = await getDocs(q);
            const messageData = querySnapshot.docs.map((doc) => doc.data());
            messageData.sort((a, b) => a.timestamp - b.timestamp);
            setMessages(messageData);
        } catch (error) {
            console.error('Error fetching chat:', error);
        }
    };

    const fetchHashtagGroups = async () => {
        try {
            const querySnapshot = await getDocs(hashtagGroupsCollection);
            const groups = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setHashtagGroups(groups);
        } catch (error) {
            console.error('Error fetching hashtag groups:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [selectedGroup]);

    useEffect(() => {
        fetchHashtagGroups();
    }, []);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const [adminEmails, setAdminEmails] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (auth.currentUser) {
                const userRolesDoc = doc(db, "users", auth.currentUser.uid);
                try {
                    const myroleSnapshot = await getDoc(userRolesDoc);
                    const myrole = myroleSnapshot.data().role;

                    if (myrole === "admin" || myrole === "superAdmin") {
                        setIsAdmin(true);
                        const adminQuerySnapshot = await getDocs(
                            query(collection(db, "users"), where("role", "==", "admin"))
                        );
                        const adminEmailArray = adminQuerySnapshot.docs.map(doc => doc.data().email);
                        setAdminEmails(adminEmailArray);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                }
            }
        };
        fetchUserRole();
    }, [auth.currentUser]);

    return (
        <>
            {isloggedIn && (
                <div className="flex h-screen antialiased text-gray-800">
                    <div className="flex flex-row h-full w-full overflow-x-hidden">
                        <button
                            className="absolute top-2 w-10 left-1 bg-gray-600 text-white p-1 rounded-lg sm:hidden"
                            onClick={toggleSidebar}
                        >
                            {isSidebarOpen ? <i className="uil uil-left-arrow-to-left"></i> : <i className="uil uil-arrow-to-right"></i>}
                        </button>

                        <div className={`flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0 ${isSidebarOpen ? '' : 'hidden sm:flex'}`}>
                            <div className="ml-4 mr-2 py-2 text-large text-white flex flex-col items-center mb-2 bg-gray-600 rounded-lg cursor-pointer" onClick={() => navigate("/dashboard")}>View Dashboard</div>

                            <div className="h-20 w-20 rounded-full border overflow-hidden container mx-auto">
                                <img
                                    src={user?.photoURL}
                                    alt="Avatar"
                                    className="h-full w-full"
                                />
                            </div>
                            <div className="text-sm font-semibold mt-2 text-center">{user?.displayName}</div>
                            <div className="flex flex-col space-y-1 mt-4 -mx-2">

                                {isAdmin && (
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none"
                                            placeholder="Create a new group"
                                            value={newGroup}
                                            onChange={(e) => setNewGroup(e.target.value)}
                                        />
                                        <button
                                            onClick={createNewGroup}
                                            className="bg-gray-600 text-white px-2 py-1 text-right float-right rounded-md mt-2 hover:bg-green-600 focus:outline-none"
                                        >
                                            Create Group
                                        </button>
                                    </div>
                                )}
                                <div className="mt-2 space-y-1 ">
                                    <p className='text-center text-white p-1 bg-gray-600 rounded-lg cursor-pointer mb-3'>Groups</p>
                                    <hr className="border-2 border-black opacity-25 rounded" />


                                    {hashtagGroups.map((group) => (
                                        <button
                                            key={group.id}
                                            onClick={() => setSelectedGroup(group.id)}
                                            className={`w-full text-center px-4 py-2 rounded-md ${selectedGroup === group.id
                                                ? 'bg-gray-200'
                                                : 'hover:bg-gray-100'
                                                }`}
                                        >
                                            {group.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                        <div className="flex flex-col flex-auto h-full p-6">
                            <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4 ">


                                {joinedGroups.includes(selectedGroup) && (
                                    <div className="mb-4">

                                        <h2>Group: {selectedGroup}</h2>
                                    </div>
                                )}
                                {selectedGroup && (
                                    <>
                                        <div className="flex flex-col h-full overflow-x-auto mb-2" ref={chatContainerRef}>

                                            {messages.map((msg, index) => (

                                                <div key={index} className="col-start-6 col-end-13 p-2 rounded-lg">


                                                    {auth.currentUser?.uid !== msg.senderId &&
                                                        <React.Fragment>

                                                            <div className='bg-gray-700 max-w-sm inline-block text-white p-2 rounded-lg ml-4'>
                                                                <p className="text-[11px] text-gray-300 ml-1">{msg.sender}</p>
                                                                <p className='text-[14px] inline-block text-white rounded-lg'>{msg.text}</p>
                                                            </div>

                                                        </React.Fragment>
                                                    }
                                                    {auth.currentUser?.uid === msg.senderId &&

                                                        <div className='bg-[#7ab4cc] max-w-sm inline-block text-white p-2 rounded-lg float-right mr-4'>
                                                            <p className='text-[14px] inline-block text-white rounded-lg'>{msg.text}</p>
                                                        </div>
                                                    }
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
                                            <div className="flex-grow ml-4">
                                                <div className="relative w-full p-2">
                                                    <input
                                                        type="text"
                                                        className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 p-4 h-10"
                                                        placeholder="Type your message..."
                                                        value={message}
                                                        onChange={(e) => setMessage(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <button
                                                    className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 rounded-xl text-white px-4 py-1 flex-shrink-0"
                                                    onClick={() => {
                                                        sendMessage()
                                                    }}
                                                >
                                                    <span>Send</span>
                                                    <span className="ml-2">
                                                        <svg
                                                            className="w-4 h-4 transform rotate-45 -mt-px"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                            ></path>
                                                        </svg>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
            )}
        </>
    );
};

export default Chat;
