import React, { useEffect } from 'react';
import { auth } from '../components/Config/firebaseconfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const Profile = ({ user, setloggedIn, isloggedIn }) => {
    const dateOfEmailCreation = user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : null;
    let navigate = useNavigate()
    useEffect(() => {
        if (!isloggedIn) {
            navigate("/")
        }
    })

    const LogutUser = () => {
        signOut(auth).then(() => {
            localStorage.clear()
            setloggedIn(false)
            navigate("/")
        })
    }

    return (
        <div className="flex items-center justify-center h-screen ">
            <div className="bg-gray-100 rounded-lg p-6 shadow-lg hover:shadow-2xl">
                <img className="w-20 h-20 rounded-full mx-auto mb-4" src={auth.currentUser?.photoURL} alt="Avatar" />
                <h3 className="text-xl font-semibold mb-2"> {user?.displayName}</h3>
                <h5 className="mb-2 ">{user?.email}</h5>
                {dateOfEmailCreation && (
                    <p className="text-gray-500">First SignIn: {dateOfEmailCreation.toLocaleDateString('en-GB')}</p>
                )}
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded mt-4"
                    onClick={() => {
                        navigate("/dashboard")
                    }}
                >
                    Back
                </button>
                <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 ml-2 rounded mt-4"
                    onClick={LogutUser}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;
