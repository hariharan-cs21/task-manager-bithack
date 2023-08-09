import React, { useEffect, useState } from 'react';
import { auth, provider } from './Config/firebaseconfig';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result.user) {
                    localStorage.setItem('isLogged', true);
                    setloggedIn(true);
                    navigate('/dashboard');
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.log("Redirecting err", error.message);
                setIsLoading(false);
            }
        };
        handleRedirectResult();
    }, []);

    if (isLoading) {
        return null;
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-r from-purple-700 to-indigo-800">
            <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-10 max-w-md space-y-6">
                <div className="text-center">
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
            </div>        </div>
    );
};

export default Login;
