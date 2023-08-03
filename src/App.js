import React, { useState } from 'react';
import './App.css';
import { auth } from './components/Config/firebaseconfig'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useAuthState } from 'react-firebase-hooks/auth';
import Profile from './components/Profile';


function App() {
  const [isloggedIn, setloggedIn] = useState(localStorage.getItem("isLogged"))
  const [user] = useAuthState(auth)
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setloggedIn={setloggedIn} />} />
        <Route path="/profile" element={<Profile isloggedIn={isloggedIn} user={user} setloggedIn={setloggedIn} />} />
        <Route path="/dashboard" element={<Dashboard isloggedIn={isloggedIn} setloggedIn={setloggedIn} user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
