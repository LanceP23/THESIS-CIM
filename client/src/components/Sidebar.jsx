import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-hot-toast';
import axios from 'axios';
import './Sidebar.css'

export default function Sidebar({adminType}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();


  useEffect (()=>{
    setIsOpen(false);
  },[adminType]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = async () =>{
    try{
      await axios.post('/logout');
      localStorage.removeItem('token');
      toast.success('Logout Successful.');
      navigate('/login');
    } catch (error){
      console.error('Login failed: ', error);
      toast.error('Logout failed.');
    }
  }

  return (
    <div>
      <button className="toggle-btn_open" onClick={toggleSidebar}>☰</button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">

          <div className='profile_container'>
            <button className="toggle-btn_close" onClick={toggleSidebar}>☰</button>
            <h2>MENU</h2>
            <div className='profile_image'>

            </div>

            <h3>{adminType}</h3>

          </div>
          
          <ul>
            <li>

              <Link to="/dashboard" onClick={closeSidebar} className='sidebar_button  ' >
                Dashboard
              </Link>

            </li>
            {adminType !== 'Organization Officer'&&(
            <li>

              <Link to="/createorg" onClick={closeSidebar} className='sidebar_button'>Manage Organization</Link>
            </li>
            )}
    
            
              <li>
                <Link to="/createannouncement" onClick={closeSidebar} className='sidebar_button ' >
                  My Community
                </Link>
              </li>

               <li>
                <Link to="" onClick={closeSidebar} className='sidebar_button  '>
                  School Calendar
                </Link>
              </li>

              <li>
                <Link to="" onClick={closeSidebar} className='sidebar_button  '>
                 Campus Comms
                </Link>
              </li>

              <li>
                <Link to="" onClick={closeSidebar} className='sidebar_button  '>
                
                  Analytics Report
                </Link>
              </li>
              <li>
                <Link to="" onClick={closeSidebar} className='sidebar_button  '>
                  Admin Settings
                </Link>
              </li>
              <li>
                <Link to="" onClick={closeSidebar} className='sidebar_button  '>
                  User Management
                </Link>
              </li>
              <li>
              {adminType === 'School Owner'?(
                <Link to="/register" className='sidebar_button  '>Register Admin Account</Link>
              ):null}
            </li>
          </ul>
        
        <div className="logout-container">
          <button onClick={handleLogout} className='logout_button'>
            <span role="img" aria-label="logout"> 🚪 </span>{' '}
            Logout
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}