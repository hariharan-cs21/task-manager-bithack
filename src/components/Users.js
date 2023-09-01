import { addDoc, collection, getDocs } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db } from './Config/firebaseconfig';
import copy from 'clipboard-copy';

const Users = ({ setCopiedUser }) => {
    const [addedUser, setAddedUser] = useState(false);
    const usersCollection = collection(db, 'users');
    const [enteredEmail, setEnteredEmail] = useState("");
    const [usersData, setUsersData] = useState([]);

    const handleAddUser = () => {
        setAddedUser(true);
    };

    const handleChange = (e) => {
        setEnteredEmail(e.target.value);
    };



    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(usersCollection);
            const userData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsersData(userData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        handleAddUser()
    }, []);

    const CopiedEmail = (email) => {
        setCopiedUser(email);
        copy(email);
    }

    return (
        <>
            {usersData.length > 0 && addedUser && (
                <div className='bg-gray-100 p-2 rounded-md mt-4 ml-2'>
                    {usersData.filter(item => item.role === 'user' || item.role === 'admin').map((item) => (
                        <div key={item.id} className='ml-2 flex justify-between items-center p-2 my-2 border-b border-gray-300'>
                            <div className='text-sm'>
                                <p className='font-semibold'>{item.name}</p>

                                <p className='font-semibold'>{item.email}</p>
                                <p className='text-gray-500'>{item.role}</p>
                            </div>
                            <button className='bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md py-1 ml-1 mb-3 px-3 text-xs font-semibold' onClick={() => CopiedEmail(item.email)}>
                                Assign
                            </button>
                        </div>
                    ))}
                </div>
            )}


        </>
    );
}

export default Users;
