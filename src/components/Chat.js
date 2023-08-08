import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getDocs,
    collection,
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

    const navigate = useNavigate();

    const chatCollection = collection(db, 'chatCollection');
    const hashtagGroupsCollection = collection(db, 'hashtagGroupsCollection');

    const isAdmin = auth.currentUser?.email === 'linktothedeveloper@gmail.com';

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
            setMessages(messageData);
        } catch (error) {
            console.error('Error fetching messages:', error);
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

    return (
        <>
            {isloggedIn && (
                <div className="flex h-screen antialiased text-gray-800">
                    <div class="flex flex-row h-full w-full overflow-x-hidden">

                        <div class="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
                            <div className="ml-4 py-2 text-large text-white flex flex-col items-center mb-1 bg-gray-600 rounded-lg cursor-pointer" onClick={() => navigate("/dashboard")}>View Dashboard</div>

                            <div class="flex flex-row items-center justify-center h-12 w-full mt-3">
                                <div
                                    class="flex items-center justify-center rounded-2xl text-gray-100 bg-gray-400 h-10 w-10"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                        ></path>
                                    </svg>
                                </div>
                                <div className="ml-2 font-bold text-2xl">QuickChat</div>
                            </div>
                            <div
                                className="flex flex-col items-center bg-gray-300 border border-gray-700 mt-4 w-full py-6 px-4 rounded-lg"
                            >
                                <div className="h-20 w-20 rounded-full border overflow-hidden">
                                    <img
                                        src={user?.photoURL}
                                        alt="Avatar"
                                        class="h-full w-full"
                                    />
                                </div>
                                <div className="text-sm font-semibold mt-2">{user?.displayName}</div>
                            </div>
                            <div className="flex flex-col space-y-1 mt-4 -mx-2">
                                <button onClick={() => window.location.reload(false)}
                                    class="flex flex-row justify-center items-center hover:bg-gray-100 rounded-xl p-2"
                                >
                                    <div className="text-sm font-semibold">Refresh</div>
                                </button>
                            </div>

                        </div>
                        <div className="flex flex-col flex-auto h-full p-6">
                            <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
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
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md mt-2 hover:bg-gray-600 focus:outline-none"
                                        >
                                            Create Group
                                        </button>
                                    </div>
                                )}
                                {!joinedGroups.includes(selectedGroup) && (
                                    <div className="mb-4">
                                        <select
                                            className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none"
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                Select a group to join
                                            </option>
                                            {hashtagGroups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                )}
                                {joinedGroups.includes(selectedGroup) && (
                                    <div className="mb-4">
                                        <h2>Group: {selectedGroup}</h2>
                                    </div>
                                )}
                                {selectedGroup && (
                                    <>
                                        <div className="flex flex-col h-full overflow-x-auto mb-4">
                                            {messages.map((msg, index) => (
                                                <div key={index} className="col-start-6 col-end-13 p-3 rounded-lg">
                                                    {msg.sender} : {msg.text}
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
                                                    onClick={sendMessage}
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
