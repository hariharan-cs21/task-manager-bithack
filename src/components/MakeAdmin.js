import React, { useState, useEffect } from 'react';
import { db, auth } from './Config/firebaseconfig';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import NotificationBar from './Notify';

const MakeAdmin = () => {
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
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
                        name: doc.data().name,
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
    const [showNotificationBar, setShowNotificationBar] = useState(false);
    const [showLayout, setShowLayout] = useState(true);

    const handleShowNotificationBar = () => {
        setShowNotificationBar(true);
        setShowLayout(false);
    };

    return (
        <>
            <div className='flex justify-end'>
                <p className='bg-blue-50 p-2 rounded'>Welcome {auth.currentUser?.displayName}</p>
            </div>
            <div className="bg-gray-100 h-full flex flex-col justify-center items-center" style={{ overflowY: "auto" }}>
                <div className="container mx-auto p-4 rounded-lg bg-white shadow-lg">
                    <h1 className={`text-xl mb-2 font-semibold text-center text-blue-700 ${auth.currentUser?.email === "linktothedeveloper@gmail.com" ? 'mt-40' : ''}`}>Admin Management</h1>
                    {isAdmin && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 text-blue-600">Make User as Admin</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <select
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="w-full p-3 border rounded-lg focus:outline-none shadow-md"
                                    >
                                        <option value="">Select a user</option>
                                        {regularUserEmails.map((user, index) => (
                                            <option key={index} value={user.email}>
                                                {user.name} : {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-center items-center">
                                    <button
                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
                                        onClick={handleMakeAdmin}
                                    >
                                        Make Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {isAdmin && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-blue-600">Demote Admin to User</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <select
                                        value={selectedUserDemote}
                                        onChange={(e) => setSelectedUserDemote(e.target.value)}
                                        className="w-full p-3 border rounded-lg focus:outline-none shadow-md"
                                    >
                                        <option value="">Select an admin to demote</option>
                                        {adminUserEmails.map((user, index) => (
                                            <option key={index} value={user.email}>
                                                {user.name} : {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-center items-center">
                                    <button
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
                                        onClick={handleDemoteUser}
                                    >
                                        Demote User
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {(isAdmin || isJustAdmin) && (
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold mb-4 text-blue-600">Users</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-blue-100">
                                            <th className="border border-gray-300 p-3">Name</th>
                                            <th className="border border-gray-300 p-3">Email</th>
                                            <th className="border border-gray-300 p-3">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminUserEmails.map((user, index) => (
                                            <tr key={index}>
                                                <td className="border border-gray-300 p-3">{user.name}</td>
                                                <td className="border border-gray-300 p-3">{user.email}</td>
                                                <td className="border border-gray-300 p-3">{user.role}</td>
                                            </tr>
                                        ))}
                                        {regularUserEmails.map((user, index) => (
                                            <tr key={index}>
                                                <td className="border border-gray-300 p-3">{user.name}</td>
                                                <td className="border border-gray-300 p-3">{user.email}</td>
                                                <td className="border border-gray-300 p-3">{user.role}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
export default MakeAdmin;
