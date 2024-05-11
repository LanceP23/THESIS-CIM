import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Login.css'
import ReactModal from 'react-modal'; 


const Login = (  ) => {
    const [showModal, setShowModal] = useState(false);
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
                
                localStorage.setItem('adminType', adminType);
                window.location.reload();
                navigate('/dashboard');
                toast.success('Login Successful!');
                
            }
        } catch (error) {
            // Check if the error is a 401 (Unauthorized) error
            if (error.response && error.response.status === 401) {
                toast.error('Incorrect email or password');
            } else {
                // Display a generic error message for other errors
                console.error('Error during login:', error);
                toast.error('An error occurred during login');
            }
        }   
    };

    

    

    return (
        <body className=" bg-[url('../src/assets/webwithLogo.png')] flex justify-center absolute top-0 left-0 bg-cover bg-center w-full h-full" >
            <Navbar/>
           
       
    
        <div className="login-form bg-[url('../src/assets/webwithLogo.png')]  ">

              

           
            <form onSubmit={loginAdmin}>
                <label className='text-white'>Admin email</label>
                <input
                    type="text"
                    placeholder="Enter Admin Email..."
                    value={data.studentemail}
                    onChange={(e) => setData({ ...data, studentemail: e.target.value })}
                    className='input input-bordered input-accent w-full max-w-xs text-white'
                />
                <label className='text-white'>Password</label>
                <input
                    type="password"
                    placeholder="Enter Your Password"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    className='input input-bordered input-accent w-full max-w-xs text-white'
                />
                <button type="submit" className='login__button' >Login</button>
            </form>

        
           


            
           
            
        </div>
     
       
        </body>



    );
};

export default Login;
