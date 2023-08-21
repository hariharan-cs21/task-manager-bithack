import React, { useState, useEffect } from 'react';
import Body from "./Body";
import { auth, db } from "../components/Config/firebaseconfig";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, where, collection, query, getDocs } from 'firebase/firestore';
import MakeAdmin from './MakeAdmin';

function SidebarButton({ isOpen, onClick }) {
    return (
        <button
            className={`text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 lg:hidden`}
            onClick={onClick}
        >
            {isOpen ? (
                <svg
                    className="w-6 h-6 ml-auto"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6 18L18 6M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : (
                <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4 6H20M4 12H20M4 18H20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </button>
    );
}

function Dashboard({ isloggedIn, setloggedIn, user }) {
    let navigate = useNavigate();


    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const handleSidebarToggle = () => {
        setIsSidebarOpen(true);
        setTimeout(() => {
            setIsSidebarOpen(false);
        }, 2800);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setIsSidebarOpen(false);
        }, 2800);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);


    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const LogutUser = () => {
        signOut(auth).then(() => {
            localStorage.clear();
            setloggedIn(false);
            setIsDropdownOpen(false);
            navigate("/")
        });
    };

    const handleProfile = () => {
        navigate("/profile");
    };
    const [adminEmails, setAdminEmails] = useState([]);

    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        const fetchUserRole = async () => {
            if (auth.currentUser) {
                const userRolesDoc = doc(db, "users", auth.currentUser.uid);
                try {
                    const myroleSnapshot = await getDoc(userRolesDoc);
                    const myrole = myroleSnapshot.data().role;

                    if (myrole === "admin" || myrole === "superAdmin") {
                        setIsAdmin(true);
                        const adminQuerySnapshot = await getDocs(
                            query(collection(db, "users"), where("role", "==", "admin"))
                        );
                        const adminEmailArray = adminQuerySnapshot.docs.map(doc => doc.data().email);
                        setAdminEmails(adminEmailArray);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                }
            }
        };
        fetchUserRole();
    }, [auth.currentUser]);
    const [showAdmin, setshowAdmin] = useState(false)
    const [showBody, setshowBody] = useState(true)
    const toggleShowAdmin = () => {
        setshowAdmin(!showAdmin);
        setshowBody(showAdmin);
    };

    return (
        <div className="flex h-screen bg-gray-200">
            <div
                className={`fixed inset-y-0 z-10 flex flex-col w-48 bg-gray-800 transform ease-in-out transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0 lg:flex-shrink-0 lg:w-48`}
            >
                <div className="flex flex-col h-full mt-2">
                    <nav className="flex-grow font-bold">
                        <Link to="/dashboard">
                            <p
                                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white mb-3 rounded-xl"
                            >
                                <i className="uil uil-dashboard ml-2 text-xl"></i>
                                <span className='ml-1'>Dashboard</span>
                            </p>
                        </Link>

                        <Link to='/chat'>
                            <p
                                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white mt-32 rounded-xl"
                            >
                                <i className="uil uil-chat ml-2 text-xl"></i>
                                <span className='ml-1'>Messenger</span>
                            </p>
                        </Link>


                        <Link to='/personaltask'>

                            <p
                                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl"
                            >
                                <i className="uil uil-house-user ml-2 text-xl"></i>
                                <span className='ml-1'>Personal Task</span>
                            </p>
                        </Link>
                        {isAdmin && (
                            <p
                                className="flex items-center cursor-pointer px-6 py-3 ml-6 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl"
                                onClick={toggleShowAdmin}>
                                {showAdmin ? "Tasks" : "Admin Access"}
                            </p>
                        )}
                    </nav>
                </div>
            </div>
            <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
                    <SidebarButton isOpen={isSidebarOpen} onClick={handleSidebarToggle} />
                    <h2 className="text-xl font-semibold ml-1">Task Manager</h2>

                    <div className="flex items-center ml-auto mr-1 justify-end">

                        <img
                            src={user?.photoURL}
                            className="rounded-full cursor-pointer"
                            width="32px"
                            height="32px"
                            alt="avatar"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown();
                            }}
                        />
                    </div>
                </header>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-14 p-2 mr-3 w-40 bg-white hover:bg-blue-100 rounded-md shadow-lg">
                        <option className="hover:bg-blue-200 rounded-md" style={{ cursor: "pointer" }} onClick={handleProfile}>
                            View Profile
                        </option>
                        <option className="hover:bg-blue-200 rounded-md" style={{ cursor: "pointer" }} onClick={LogutUser}>
                            Logout
                        </option>
                    </div>
                )}
                {showAdmin && <MakeAdmin />}
                {isAdmin ?
                    <>
                        {showBody && <Body isloggedIn={isloggedIn} user={user} isAdmin={isAdmin} />}</> :
                    <Body isloggedIn={isloggedIn} user={user} isAdmin={isAdmin} />
                }
            </div>
        </div>
    );
}

export default Dashboard;
