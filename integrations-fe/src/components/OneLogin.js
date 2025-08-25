import React, { useEffect } from "react";
import axios from 'axios';
import './OneLogin.css';
const OneLogin = () => {

    // useEffect(()=>{

    // },[])

    const handleLogin = () => {
  window.location.href = "http://localhost:5000/api/onelogin/login";
};
    return (
        <>
        <h1>Login page</h1>
        <div>
            <button className="login-btn" onClick={handleLogin}>
                Login with Onelogin
            </button>
        </div>
        </>
    )
}

export default OneLogin;