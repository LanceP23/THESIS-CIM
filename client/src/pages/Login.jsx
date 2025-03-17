import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { SidebarContext } from '../../context/SidebarContext';
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
        const checkAuthStatus = async () => {
          try {
            const response = await axios.get('/check-auth');
            if (!response.data.authenticated) {
              // If not authenticated, redirect to login
              navigate('/login');
            } else {
              // If authenticated, set the admin type
              setAdminType(localStorage.getItem('adminType'));
            }
          } catch (error) {
            console.error('Error checking authentication status:', error);
          }
        };
    
        checkAuthStatus();
      }, [navigate]);
    useEffect(() => {
        const handleTabKey = (e) => {
            const allowedIds = ['adminEmail', 'password', 'loginButton'];
            if (e.key === 'Tab' && !allowedIds.includes(e.target.id)) {
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleTabKey);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleTabKey);
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form, e.target);
            if (index === form.length - 1) {
                e.preventDefault();
                form.elements[0].focus();
            }
        }
    };

    

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
                toast.success('Login Successful!');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                  }, 500);
                
                
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
        <body className=" bg-[url('/assets/CORPO_CIM/gradeint_cover.gif')] flex justify-center absolute top-0 left-0 bg-cover bg-center w-full h-full" >
            <Navbar/>
           
       
    
        <div className="login-form  bg-slate-950 bg-opacity-50 animate-text-reveal   ">

            <div className="flex justify-center">

            <img src='/assets/CORPO_CIM/LOGO_ONLY_cut.png' className='w-12 mb-2'/>

            </div>

              
           
            <form onSubmit={loginAdmin} >
                
                <div className="text-left">
                <label className='text-white '>Administrator E-mail</label>
                <input
                    id="adminEmail"
                    type="text"
                    placeholder="Enter Admin Email..."
                    value={data.studentemail}
                    onChange={(e) => setData({ ...data, studentemail: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className='input input-bordered input-accent w-full max-w-sm  dark:text-white shadow-2xl'
                />
                </div>

                <div className="text-left">
                <label className='text-white'>Password</label>
                <input
                    id = "password"
                    type="password"
                    placeholder="Enter Your Password"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className='input input-bordered input-accent w-full max-w-sm dark:text-white shadow-2xl'
                />
                </div>
                

                <div className="">
               <button id = "loginButton" onKeyDown={handleKeyDown} type="submit" className='btn btn-wide btn-success  text-white mt-2' >Login</button>
               </div>
            </form>
            </div>

         

            

        
           


            
           
            
   
     
       
        </body>



    );
};

export default Login;
