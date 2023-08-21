import React, { useState, useEffect } from 'react';
import './App.css';
import { auth, db } from './components/Config/firebaseconfig';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useAuthState } from 'react-firebase-hooks/auth';
import Profile from './components/Profile';
import Chat from './components/Chat';
import PersonalTask from './components/PersonalTask';
import { collection, getDocs } from 'firebase/firestore';

function App() {
  const [isloggedIn, setloggedIn] = useState(localStorage.getItem("isLogged"));
  const [user] = useAuthState(auth);
  const isadmin = "linktothedeveloper@gmail.com";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setloggedIn={setloggedIn} />} />
        <Route path="/profile" element={<Profile isloggedIn={isloggedIn} user={user} setloggedIn={setloggedIn} />} />
        <Route path="/dashboard" element={<Dashboard isloggedIn={isloggedIn} setloggedIn={setloggedIn} user={user} />} />
        <Route
          path="/chat"
          element={
            <Chat
              isloggedIn={isloggedIn}
              setloggedIn={setloggedIn}
              user={user}
              isadmin={isadmin}
            />
          }
        />
        <Route path="/personaltask" element={<PersonalTask isloggedIn={isloggedIn} setloggedIn={setloggedIn} user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;


