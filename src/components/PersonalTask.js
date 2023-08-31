import React, { useEffect } from 'react';
import PersonalTaskCard from './PersonalTaskCard';
import { useNavigate } from 'react-router-dom';

const PersonalTask = ({ user, isloggedIn }) => {
    let navigate = useNavigate()
    useEffect(() => {
        if (!isloggedIn) {
            navigate("/")
        }
    })
    return (

        <PersonalTaskCard user={user} />
    )
}

export default PersonalTask;
