import React, { useState, useEffect } from 'react';
import { db, auth } from './Config/firebaseconfig';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';

const MakeAdmin = () => {
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState('');
    const [isJustAdmin, setIsJustAdmin] = useState(false);
    const [userDetails, setUserDetails] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedUserDemote, setSelectedUserDemote] = useState('');


    useEffect(() => {
        const fetchUserRole = async () => {
            if (auth.currentUser) {
                const userRolesDoc = doc(db, 'users', auth.currentUser.uid);
                try {
                    const myroleSnapshot = await getDoc(userRolesDoc);
                    const myrole = myroleSnapshot.data().role;
                    setCurrentUserRole(myrole);
                    setIsAdmin(myrole === 'superAdmin');
                    setIsJustAdmin(myrole === 'admin');
                } catch (error) {
                    console.error('Error fetching user role:', error);
                }
            }
        };
        const fetchUserDetails = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const details = querySnapshot.docs
                    .filter(doc => doc.data().role === 'admin' || doc.data().role === 'user')
                    .map(doc => ({
                        email: doc.data().email,
                        role: doc.data().role,
                    }));
                setUserDetails(details);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserRole();
        fetchUserDetails();
    }, [auth.currentUser]);

    const handleMakeAdmin = async () => {
        if (!isAdmin) {
            return;
        }

        if (!selectedUser) {
            alert("Please select a user to make an admin.");
            return;
        }

        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const userDoc = querySnapshot.docs.find(doc => doc.data().email === selectedUser);

            if (userDoc) {
                const emailRole = userDoc.data().role;
                if (emailRole === 'user') {
                    await updateDoc(doc(db, 'users', userDoc.id), { role: 'admin' });
                    alert(`User with email ${selectedUser} is now an admin.`);
                } else if (emailRole === 'admin') {
                    alert(`User with email ${selectedUser} is already an admin.`);
                } else {
                    alert(`Invalid role for user with email ${selectedUser}.`);
                }
            } else {
                alert(`User with email ${selectedUser} doesn't exist.`);
            }
        } catch (error) {
            alert("Error fetching or updating data:", error);
        }
    };
    const handleDemoteUser = async () => {
        if (!isAdmin) {
            console.log("Only superAdmin can demote users.");
            return;
        }

        if (!selectedUserDemote) {
            alert("Please select an admin user to demote.");
            return;
        }

        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const userDoc = querySnapshot.docs.find(doc => doc.data().email === selectedUserDemote);

            if (userDoc) {
                const emailRole = userDoc.data().role;
                if (emailRole === 'admin') {
                    await updateDoc(doc(db, 'users', userDoc.id), { role: 'user' });
                    alert(`User with email ${selectedUserDemote} is now a regular user.`);
                } else {
                    alert(`User with email ${selectedUserDemote} is not an admin.`);
                }
            }
        } catch (error) {
            alert("Error demoting user:", error);
        }
    };
    useEffect(() => {
        handleDemoteUser()
        handleMakeAdmin()
    }, [])
    const adminUserEmails = userDetails.filter(user => user.role === 'admin');
    const regularUserEmails = userDetails.filter(user => user.role === 'user')
    return (
        <div className="bg-slate-50 flex items-center justify-center h-screen bg-gray-100">
            <div className=" p-8 rounded-lg w-full max-w-6xl h-[80vh] overflow-y-auto flex flex-col sm:flex-row">
                <div className='flex flex-col'>
                    <div className='flex flex-row'>
                        {(isAdmin) && (
                            <div className="w-full sm:w-1/2 pr-4">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">Make User as Admin</h2>
                                    <select
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select a user</option>
                                        {regularUserEmails.map((user, index) => (
                                            <option key={index} value={user.email}>{user.email}</option>
                                        ))}
                                    </select>
                                    <button
                                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                                        onClick={handleMakeAdmin}
                                    >
                                        Make Admin
                                    </button>
                                </div>
                            </div>
                        )}
                        {isAdmin && (
                            <div className="w-full sm:w-1/2 pl-4">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4">Demote Admin to User</h2>
                                    <select
                                        value={selectedUserDemote}
                                        onChange={(e) => setSelectedUserDemote(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select an admin to demote</option>
                                        {adminUserEmails.map((user, index) => (
                                            <option key={index} value={user.email}>{user.email}</option>
                                        ))}
                                    </select>
                                    <button
                                        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                                        onClick={handleDemoteUser}
                                    >
                                        Demote User
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {(isAdmin || isJustAdmin) && (
                        <div className="w-full sm:w-full pl-4 mt-4">
                            <h2 className="text-2xl font-semibold mb-4">Users</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {adminUserEmails.map((user, index) => (
                                    <div key={index} className="bg-blue-100 p-4 rounded-md">
                                        <p className="text-blue-700 font-semibold">{user.email}</p>
                                        <p className="text-gray-600">Role: {user.role}</p>
                                    </div>
                                ))}
                                {regularUserEmails.map((user, index) => (
                                    <div key={index} className="bg-green-100 p-4 rounded-md">
                                        <p className="text-blue-700 font-semibold">{user.name}</p>
                                        <p className="text-green-700 font-semibold">{user.email}</p>
                                        <p className="text-gray-600">Role: {user.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>


    );
};
export default MakeAdmin;
