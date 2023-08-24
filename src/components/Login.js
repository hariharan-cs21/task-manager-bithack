import React, { useEffect, useState } from 'react';
import { auth, provider, db } from './Config/firebaseconfig';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getDocs, collection } from 'firebase/firestore';

const Login = ({ setloggedIn }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isRegisteredUser, setIsRegisteredUser] = useState(true);
    const [isRedirectionComplete, setIsRedirectionComplete] = useState(false);
    const navigate = useNavigate();

    const signIn = async () => {
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.log("Error occurred during sign-in:", error.message);
        }
    };

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                await getRedirectResult(auth);
                if (auth.currentUser) {
                    const user = auth.currentUser;
                    const userEmail = user.email;

                    const userCollection = collection(db, 'users');
                    const userQuerySnapshot = await getDocs(userCollection);

                    const isUserRegistered = userQuerySnapshot.docs.some(
                        doc => doc.data().email === userEmail
                    );

                    if (isUserRegistered) {
                        localStorage.setItem('isLogged', true);
                        setloggedIn(true);
                        navigate("/dashboard");
                    } else {
                        setIsRegisteredUser(false);
                    }
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.log("Redirecting err", error.message);
            } finally {
                setIsLoading(false);
                setIsRedirectionComplete(true);
            }
        };
        handleRedirectResult();
    }, []);


    return (
        <div className="flex items-center justify-center h-screen bg-blue-200">
            <div className="w-full rounded-lg sm:w-60 md:w-2/3 lg:w-2/5 xl:w-2/5 bg-blue-50 p-2 sm:p-4 md:p-6 flex items-center justify-center">
                <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                    <div className="text-center mb-6">
                        <h2 className="text-4xl font-extrabold text-gray-800">Task Manager</h2>
                        <p className="text-sm text-gray-500">Effortlessly Organize Your Tasks</p>
                    </div>
                    <div className="flex justify-center items-center">
                        {isRedirectionComplete && (
                            isRegisteredUser ? (
                                <button
                                    onClick={signIn}
                                    className="flex items-center gap-4 bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <img
                                        className="w-8 h-8"
                                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                                        loading="lazy"
                                        alt="Google logo"
                                    />
                                    <span className="text-lg font-semibold">Sign in with Google</span>
                                </button>
                            ) : (
                                <div className="p-4 bg-red-100 rounded-lg">
                                    <p className="text-red-600 text-center">
                                        You are not a registered user. Please contact the administrator.
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
