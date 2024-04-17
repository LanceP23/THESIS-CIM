import React, { useState, useEffect,useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-hot-toast';
import axios from 'axios';
import './Sidebar.css'
import { UserContext } from '../../context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDashboard, faPeopleArrows,  faChartBar, faComment, faLock, faBullhorn, faAddressCard } from '@fortawesome/free-solid-svg-icons';


export default function Sidebar() {
  const { user } = useContext(UserContext);
  const adminType = user ? user.adminType : null;
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
            <li className='fa-fa' >
            

              <Link to="/dashboard" onClick={closeSidebar} className='sidebar_button  ' >
              <FontAwesomeIcon icon={faDashboard} className='sidebar_icons' />     Dashboard
              </Link>

            </li>
            {adminType !== 'Organization Officer'&&(
            <li>

              <Link to="/createorg" onClick={closeSidebar} className='sidebar_button'> 
              <FontAwesomeIcon className='sidebar_icons' icon={faPeopleArrows} />     Manage Organization
              </Link>
            </li>
            )}
    
            
              <li>
                <Link to="/dashboard" onClick={closeSidebar} className='sidebar_button ' >
                <FontAwesomeIcon className='sidebar_icons' icon={faPeopleArrows} />    My Community
                </Link>
              </li>

              <li>
                <Link to="/chat" onClick={closeSidebar} className='sidebar_button  '>
                <FontAwesomeIcon className='sidebar_icons' icon={faComment} />     Campus Comms
                </Link>
              </li>

              <li>
                <Link to="" onClick={closeSidebar} className='sidebar_button  '>
                <FontAwesomeIcon  className='sidebar_icons'icon={faChartBar} />     Analytics Report
                </Link>
              </li>
              <li>
                <Link to="" onClick={closeSidebar} className='sidebar_button  '>
                <FontAwesomeIcon className='sidebar_icons' icon={faLock} />     Admin Settings
                </Link>
              </li>
              <li>
                <Link to="/createannouncement" onClick={closeSidebar} className='sidebar_button  '>
                <FontAwesomeIcon className='sidebar_icons' icon={faBullhorn} />    Post Management
                </Link>
              </li>
              <li>
              {adminType === 'School Owner'?(
                <Link to="/register" className='sidebar_button  '>
                  <FontAwesomeIcon  className='sidebar_icons' icon={faAddressCard} />    Account Registration
                  </Link>
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