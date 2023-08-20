import React, { useState, useEffect } from 'react';
import { db, auth } from './Config/firebaseconfig';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';

const MakeAdmin = () => {
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState("")

    useEffect(() => {
        const fetchCurrentUserRole = async () => {
            if (auth.currentUser) {
                const userRolesDoc = doc(db, "users", auth.currentUser.uid);
                try {
                    const myroleSnapshot = await getDoc(userRolesDoc);
                    if (myroleSnapshot.exists()) {
                        const myrole = myroleSnapshot.data().role;
                        setCurrentUserRole(myrole);
                        setIsAdmin(myrole === "superAdmin");
                    } else {
                        console.log("User role document not found.");
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                }
            }
        };

        fetchCurrentUserRole();
    }, []);


    const handleMakeAdmin = async () => {
        if (!isAdmin) {
            console.log("Only superAdmin can change roles.");
            return;
        }

        if (!email) {
            alert("Please enter a user's email.");
            return;
        }

        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const userDoc = querySnapshot.docs.find(doc => doc.data().email === email);

            if (userDoc) {
                const emailRole = userDoc.data().role;
                if (emailRole === 'user') {
                    await updateDoc(doc(db, 'users', userDoc.id), { role: 'admin' });
                    alert(`User with email ${email} is now an admin.`);
                } else if (emailRole === 'admin') {
                    alert(`User with email ${email} is already an admin.`);
                } else {
                    alert(`Invalid role for user with email ${email}.`);
                }
            } else {
                alert(`User with email ${email} doesn't exist.`);
            }
        } catch (error) {
            alert("Error fetching or updating data:", error);
        }
    };
    return (
        <div>
            <h2>Make User an Admin</h2>
            <input
                type="email"
                placeholder="User's Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleMakeAdmin}>Make Admin</button>

        </div>
    );
};

export default MakeAdmin;
