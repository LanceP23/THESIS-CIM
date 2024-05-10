import React, { useState, useEffect,useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-hot-toast';
import axios from 'axios';
import { UserContext } from '../../context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPeopleArrows,  faChartBar, faComment, faLock, faBullhorn, faAddressCard, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import NotificationBell from './NotificationBell';

const Navbar_2 = () => {
    const { user } = useContext(UserContext);
  const adminType = user ? user.adminType : null;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect (()=>{
    setIsOpen(false);
  },[adminType]);

  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      document.querySelector('.link_container').classList.remove('open');
    } else {
      document.querySelector('.link_container').classList.add('open');
    }
  }

  const closeSidebar = () => {
    setIsOpen(false);
    document.querySelector('.link_container').classList.remove('open');
  }
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
    <nav className='navbar_2 ' >
      
  <div className="navbar ">
  <div className="flex">

  

  <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-success text-white  " >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-auto w-5  " fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
      </div>
      <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 p-2 z-[1] shadow bg-green-800 transition duration-300 ease-out w-max grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
       
      <li  >
            

            <Link to="/dashboard" onClick={closeSidebar} className=' ' >
              
            <FontAwesomeIcon icon={faHome} className='' />  
            <div className="">   
            <h6 className=''>Dashboard</h6>
            </div>
            </Link>

          </li>
          
          <li className=''>

            <Link to="/createorg" onClick={closeSidebar} className=''> 
            <FontAwesomeIcon className='navbar_icons' icon={faPeopleArrows} />   
            <div className="">
            <h6 className=''>  Manage Organization</h6>
            </div>
            </Link>
          </li>

  
          
            <li className=''>
              <Link to="/dashboard" onClick={closeSidebar} className='' >
              <FontAwesomeIcon className='navbar_icons' icon={faPeopleArrows} /> 
              <div className="">
              <h6 className=''>   My Community</h6>
              </div>
              </Link>
            </li>

            <li className=''>
              <Link to="/campcomms" onClick={closeSidebar} className=' '>
              <FontAwesomeIcon className='navbar_icons' icon={faComment} /> 
              <div className="">
                <h6 className=''>Campus Comms </h6>  
                </div>
              </Link>
            </li>

            <li className=''>
              <Link to="/dashboard" onClick={closeSidebar} className=''>
              <FontAwesomeIcon  className=''icon={faChartBar} />  
              <div className="">
              <h6 className=''>   Analytics Report</h6>
              </div>
              </Link>
            </li>
            <li className=''>
              <Link to="/user-settings" onClick={closeSidebar} className=' '>
              <FontAwesomeIcon className='navbar_icons' icon={faLock} /> 
              <div className="">
                <h6 className=''>User Settings</h6>  
                </div>
              </Link>
            </li>
            <li className=''>
              <Link to="/createannouncement" onClick={closeSidebar} className=''>
              <FontAwesomeIcon className='navbar_icons' icon={faBullhorn} />  
              <div className="">
              <h6 className=''> Post Management </h6> 
              </div>
              </Link>
            </li>
            <li className=''>
            {adminType === 'School Owner'?(
              <Link to="/register" className=''>
                <FontAwesomeIcon  className='' icon={faAddressCard} />  
                <div className="">
                <h6 className=''>  Account Registration</h6>
                </div>
                </Link>
            ):null}
          </li>
      </ul>
    </div>

   
  </div>
  <div className="flex-1">
  <img src='../src/assets/logo.png' className=' h-auto w-28'></img>
  </div>
  <div className="flex flex-row">
    <div className="div">
        
    <button className="btn btn-success mx-1 dropdown dropdown-end">
      <div tabIndex={0} role="button" className="indicator m-1 ">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 " fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
</div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <NotificationBell/>
        </ul>
    </button>

    </div>
    
    <div className="dropdown dropdown-end">
      <div  className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img alt="Tailwind CSS Navbar component" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
        
        </div>
        
        
      </div>
      <a tabIndex={0} role="button" className="btn btn-ghost btn-md text-s text-white">{adminType}</a>
      <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-white">
      
        <li  onClick={handleLogout}><a>Logout</a></li>
      </ul>
    </div>

   
    
  
  </div>




       
        </div>
       

       


    </nav>
  )
}

export default Navbar_2
