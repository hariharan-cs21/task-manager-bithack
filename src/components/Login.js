import React, { useEffect, useState } from 'react';
import { auth, provider, db } from './Config/firebaseconfig';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Login = ({ setloggedIn }) => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const signIn = async () => {
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.log("Error occurred during sign-in:", error.message);
        }
    };

    const determineUserRole = (user) => {
        const superAdminEmail = "linktothedeveloper@gmail.com";

        if (user.email === superAdminEmail) {
            return "superAdmin";
        } else {
            return "user";
        }
    };

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                await getRedirectResult(auth);
                if (auth.currentUser) {
                    const user = auth.currentUser;
                    const userEmail = user.email;
                    const userRef = doc(db, 'users', user.uid);

                    const existingRoleSnapshot = await getDoc(userRef);
                    const existingRole = existingRoleSnapshot.exists()
                        ? existingRoleSnapshot.data().role
                        : '';

                    const role = existingRole || determineUserRole(user);

                    if (role === "superAdmin" || role === "user") {
                        await setDoc(userRef, {
                            email: userEmail,
                            role: role
                        });

                        localStorage.setItem('isLogged', 'true');
                        setloggedIn(true);
                        navigate("/dashboard");
                    }
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.log("Redirecting error", error.message);
                setIsLoading(false);
            }
        };
        handleRedirectResult();
    }, [navigate, setloggedIn]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div className="text-xl font-medium text-gray-700">Signing you in...</div>
                    </div>
                </div>
            </div>

        );
    }

    return (
        <div className="flex items-center justify-center h-screen bg-blue-200">
            <div className="w-full rounded-lg sm:w-60 md:w-2/3 lg:w-2/5 xl:w-1/3 bg-blue-50 p-2 sm:p-4 md:p-6 flex items-center justify-center">
                <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                    <div className="text-center mb-6">
                        <h2 className="text-4xl font-extrabold text-gray-800">Task Manager</h2>
                        <p className="text-sm text-gray-500">Effortlessly Organize Your Tasks</p>
                    </div>
                    <div className="flex justify-center items-center">
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
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
