import React, { useEffect } from 'react';
import { auth, provider } from './Config/firebaseconfig';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = ({ setloggedIn }) => {
    let navigate = useNavigate();

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
                }
            } catch (error) {
                console.log("Redirecting err", error.message);
            }
        };
        handleRedirectResult();
    }, []);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white border border-gray-300 rounded-lg shadow-2xl px-6 py-10 max-w-xs mb-2">
                <div className="mb-6">
                    <h3 className="text-xl font-bold">Task Manager</h3>
                </div>
                <div className="flex justify-center items-center">
                    <button onClick={signIn} className="px-2 py-2 border flex gap-2 border-gray-400 rounded-lg text-black hover:border-gray-500 hover:text-black hover:shadow transition duration-100">
                        <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="Google logo" />
                        <span>Login with Google</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
