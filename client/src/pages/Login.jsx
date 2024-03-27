import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Login = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        studentemail: '',
        password: '',
    });

    useEffect(() => {
        // Check if the user is already authenticated
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('/check-auth'); // Adjust the endpoint based on your backend
                if (response.data.authenticated) {
                    navigate('/dashboard'); // Redirect to dashboard if already authenticated
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
            }
        };

        checkAuthStatus();
    }, [navigate]);

    const loginAdmin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/login', {
                studentemail: data.studentemail,
                password: data.password,
            });
            const { error, adminType } = response.data;
            if (error) {
                toast.error(error);
            } else {
                toast.success('Login Successful!');
                localStorage.setItem('adminType', adminType);
                navigate('/dashboard'); // Redirect to dashboard after successful login
            }
        } catch (error) {
            console.error('Error during login:', error);
            toast.error('An error occurred during login');
        }   
    };

    return (
        <div className="login-form">
            <Navbar/>
            <form onSubmit={loginAdmin}>
                <label>Admin email</label>
                <input
                    type="text"
                    placeholder="Enter Admin Email..."
                    value={data.studentemail}
                    onChange={(e) => setData({ ...data, studentemail: e.target.value })}
                />
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter Your Password"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
