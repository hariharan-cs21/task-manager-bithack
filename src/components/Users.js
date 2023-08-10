import { addDoc, collection, getDocs } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db } from './Config/firebaseconfig';
import copy from 'clipboard-copy';

const Users = ({ setCopiedUser }) => {
    const [addedUser, setAddedUser] = useState(false);
    const usersCollection = collection(db, 'usersCollection');
    const [enteredEmail, setEnteredEmail] = useState("");
    const [usersData, setUsersData] = useState([]);

    const handleAddUser = () => {
        setAddedUser(true);
    };

    const handleChange = (e) => {
        setEnteredEmail(e.target.value);
    };

    const EmailAddfunc = async (e) => {
        if (e.key === 'Enter') {
            try {
                await addDoc(usersCollection, {
                    email: enteredEmail,
                });
                alert("Added User");
                setEnteredEmail("");
                fetchUsers();
            } catch (error) {
                console.error("Error adding user:", error);
            }
        }
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
    });

    const CopiedEmail = (email) => {
        setCopiedUser(email);
        copy(email);
    }

    return (
        <>
            <div className="bg-green-300 rounded-lg p-1 w-20 ml-2">
                <h2 className="ml-2 text-sm md:text-sm lg:text-sm font-bold cursor-pointer" onClick={handleAddUser}>Add User</h2>
            </div>
            {addedUser &&
                <input placeholder='Add an Email' className='p-1 m-1' onChange={handleChange}
                    value={enteredEmail} onKeyDown={EmailAddfunc}></input>
            }
            {addedUser &&
                <div className='bg-gray-300 p-2 rounded-lg mt-2'>
                    {usersData.map((item) => (
                        <div key={item.id} className='flex justify-between p-1 m-1'>
                            <h2 className='text-sm p-0.5'>{item.email}</h2>
                            <button className='bg-white rounded-lg p-0.5 text-sm' onClick={() => CopiedEmail(item.email)}>Assign</button>
                        </div>
                    ))}
                </div>
            }
        </>
    );
}

export default Users;
