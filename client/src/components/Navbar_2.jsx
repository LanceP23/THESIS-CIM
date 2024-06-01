import React, { useState, useEffect,useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-hot-toast';
import axios from 'axios';
import { UserContext } from '../../context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPeopleArrows,  faChartBar, faComment, faLock, faBullhorn, faAddressCard, faRightFromBracket, faCalendar, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import NotificationBell from './NotificationBell';

const Navbar_2 = () => {
    const { user } = useContext(UserContext);
  const adminType = user ? user.adminType : null;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0); 

  const userName = user ? user.name : '';

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
   
  }
  const handleLogout = async () =>{
    try{
      await axios.post('/logout');
      localStorage.removeItem('token');
      toast.success('Logout Successful.');
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      
      
    } catch (error){
      console.error('Login failed: ', error);
      toast.error('Logout failed.');
    }
  };
  
  return (
    <nav className='navbar_2 h-16 ' >
      <div className="navbar  ">
        <div className="flex">

  

  <div className="dropdown ">

  {/*swap swap-rotate*/} 
  <label tabIndex={0} role="button" className="btn btn-square btn-ghost text-white" >
  
   {/* this hidden checkbox controls the state 
  <input type="checkbox" />*/}
  
  
  {/* hamburger icon */}
  <svg className="swap-off fill-current " xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z"/></svg>
  
  {/* close icon 
  <svg className="swap-on fill-current"    xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49"/></svg>
  */}
</label>
      
<ul tabIndex={0} className="menu menu-sm dropdown-content mt-1 p-2 z-[1] shadow bg-green-950 transition duration-300 ease-out w-max grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 text-center">
       
      <li className=' ' >
            

            <Link to="/dashboard" onClick={closeSidebar} className=' ' >
              
            <FontAwesomeIcon icon={faHome} className='text-yellow-500' />  
            <div className="">   
            <h6 className='font-bold'>Dashboard</h6>
            </div>
            </Link>

          </li>

          <li className=''>
              <Link to="/createannouncement" onClick={closeSidebar} className=''>
              <FontAwesomeIcon className='text-yellow-500' icon={faBullhorn} />  
              <div className="">
              <h6 className='font-bold'> Post Management </h6> 
              </div>
              </Link>
            </li>

            <li className=''>
              <Link to="/event-calendar" onClick={closeSidebar} className=''>
              <FontAwesomeIcon className='text-yellow-500' icon={faCalendarCheck} />  
              <div className="">
              <h6 className='font-bold'>Event Calendar</h6> 
              </div>
              </Link>
            </li>

              
            <li className=''>
              <Link to="/community-landing" onClick={closeSidebar} className='' >
              <FontAwesomeIcon className='text-yellow-500' icon={faPeopleArrows} /> 
              <div className="">
              <h6 className='font-bold'>   My Community</h6>
              </div>
              </Link>
            </li>

            <li className=''>
              <Link to="/analytics-report" onClick={closeSidebar} className=''>
              <FontAwesomeIcon  className='text-yellow-500'icon={faChartBar} />  
              <div className="">
              <h6 className='font-bold'>   Analytics Report</h6>
              </div>
              </Link>
            </li>

            
            <li className=''>
              <Link to="/campcomms" onClick={closeSidebar} className=' '>
              <FontAwesomeIcon className='text-yellow-500' icon={faComment} /> 
              <div className="">
                <h6 className='font-bold'>Campus Comms </h6>  
                </div>
              </Link>
            </li>

          
          <li className=''>

            <Link to="/createorg" onClick={closeSidebar} className=''> 
            <FontAwesomeIcon className='text-yellow-500' icon={faPeopleArrows} />   
            <div className="">
            <h6 className='font-bold'>  Manage Organization</h6>
            </div>
            </Link>
          </li>

  
        

        
            <li className=''>
              <Link to="/user-settings" onClick={closeSidebar} className=' '>
              <FontAwesomeIcon className='text-yellow-500' icon={faLock} /> 
              <div className="">
                <h6 className='font-bold'>Mobile User Management</h6>  
                </div>
              </Link>
            </li>
            

            
            <li className=''>
            {adminType === 'School Owner'?(
              <Link to="/register" className=''>
                <FontAwesomeIcon  className='text-yellow-500' icon={faAddressCard} />  
                <div className="">
                <h6 className=' font-bold'>  Account Registration</h6>
                </div>
                </Link>
            ):null}
          </li>
      </ul>
    </div>

   
  </div>
  <div className="flex-1">


<Link to="/dashboard" className=' btn-link '>
  <img src='../src/assets/CORPO_CIM/CORPO SIDE_cut.png' className=' h-full w-36 mt-1 mx-0  '/>
  </Link>
  </div>
  <div className="flex flex-row">
  <div className="indicator">
  {totalUnreadCount > 0 && (
     <span className="indicator-item indicator-start badge badge-secondary bg-yellow-200">{totalUnreadCount}</span>
   )}
    <button className="btn btn-success mx-1 dropdown dropdown-end btn-sm btn-circle">
      <div tabIndex={0} role="button" className="indicator m-1 " >
  
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400  " data-tip="Notif" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
</div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <NotificationBell setTotalUnreadCount={setTotalUnreadCount}/>
        </ul>
    </button>

    </div>
    
    <div className="dropdown dropdown-end">
      <div  className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img alt="Tailwind CSS Navbar component" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
        
        </div>
        
        
      </div>
      <a tabIndex={0} role="button" className="btn btn-ghost btn-md text-s text-white">{userName}</a>
      <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-white">
          <li>Admin Level: {adminType}</li>
          <li></li>
          <li  onClick={handleLogout} className=' bg-red-600 rounded-lg'><a>Logout</a></li>
      </ul>
    </div>

   
    
  
  </div>




       
        </div>
       

       


    </nav>
  )
}

export default Navbar_2
