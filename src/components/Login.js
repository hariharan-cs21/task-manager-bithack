import React, { useEffect, useState } from 'react';
import { auth, provider, db } from './Config/firebaseconfig';
import { signInWithPopup, getRedirectResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import facebookimg from "./facebook.svg";

const Login = ({ setloggedIn }) => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const signIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user) {
                const userEmail = user.email;
                const username = user.displayName;
                const userRef = doc(db, 'users', user.uid);

                const existingRoleSnapshot = await getDoc(userRef);
                const existingRole = existingRoleSnapshot.exists()
                    ? existingRoleSnapshot.data().role
                    : '';

                const role = existingRole || determineUserRole(user);

                if (role === "superAdmin" || role === "user") {
                    await setDoc(userRef, {
                        name: username,
                        email: userEmail,
                        role: role
                    });

                    localStorage.setItem('isLogged', 'true');
                    setloggedIn(true);
                    navigate("/dashboard");
                }
            }
        } catch (error) {
            console.log("Error occurred during sign-in:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const determineUserRole = (user) => {
        const superAdminEmail = "";

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
            } catch (error) {
                console.log("Redirecting error", error.message);
            } finally {
                setIsLoading(false);
            }
        };
        handleRedirectResult();
    }, []);

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
            <div className="w-full rounded-lg sm:w-80 md:w-2/3 lg:w-2/5 xl:w-1/3 bg-blue-50 p-6 sm:p-8 md:p-10 flex items-center justify-center">
                <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-extrabold text-gray-800">Task Manager</h1>
                        <p className="text-sm text-gray-500">Effortlessly Organize Your Tasks</p>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-600 text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-2 rounded-lg border focus:ring-blue-400 focus:border-blue-400"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-600 text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-2 rounded-lg border focus:ring-blue-400 focus:border-blue-400"
                            placeholder="Enter your password"
                        />
                    </div>
                    <div className="flex justify-center items-center mb-8">
                        <button
                            onClick={signIn}
                            className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Sign In
                        </button>
                    </div>
                    <div className="flex justify-center gap-4 items-center">
                        <button
                            onClick={signIn}
                            className="flex items-center rounded-lg px-5 py-3 shadow-lg "
                        >
                            <img
                                className="w-8 h-8"
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google logo"
                            />
                        </button>
                        <button
                            className="flex items-center rounded-lg px-5 py-3 shadow-lg"
                        >
                            <img
                                className="w-8 h-8"
                                src={facebookimg}
                                alt="facebook logo"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
