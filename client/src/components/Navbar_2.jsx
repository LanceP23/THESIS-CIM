import React, { useState, useEffect,useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-hot-toast';
import axios from 'axios';
import { UserContext } from '../../context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPeopleArrows,  faChartBar, faComment, faLock, faBullhorn, faAddressCard, faRightFromBracket, faCalendar, faCalendarCheck, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import NotificationBell from './NotificationBell';
import MessageDropdown from './MessageDropdown'; 
const Navbar_2 = () => {
    const { user } = useContext(UserContext);
  const adminType = user ? user.adminType : null;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0); 
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
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
  const resetUnreadCount = () => {
    setTotalUnreadCount(0);
};

 const resetUnreadMessageCount = () =>{
  setTotalUnreadMessages(0);
 }
  
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
              {adminType === 'School Owner'?(
                <Link to="/user-settings" onClick={closeSidebar} className=' '>
                <FontAwesomeIcon className='text-yellow-500' icon={faLock} /> 
                <div className="">
                  <h6 className='font-bold'>Mobile User Management</h6>  
                  </div>
                </Link>
              ):<>
                <Link to="/createorg" onClick={closeSidebar} className='' >
                <FontAwesomeIcon className='text-yellow-500' icon={faPeopleArrows} /> 
                <div className="">
                <h6 className='font-bold'>  Organizations </h6>
                </div>
                </Link>        
                </> }
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
             
          <li className=''>
          {adminType === 'School Owner'?(
            <Link to="/createorg" onClick={closeSidebar} className=''> 
            <FontAwesomeIcon className='text-yellow-500' icon={faPeopleArrows} />   
            <div className="">
            <h6 className='font-bold'>  Manage Organization</h6>
            </div>
            </Link>
            ):null}
          </li>
          <li className=''>
            {adminType === 'School Owner'?(
              <Link to="/community-landing" onClick={closeSidebar} className='' >
              <FontAwesomeIcon className='text-yellow-500' icon={faPeopleArrows} /> 
              <div className="">
              <h6 className='font-bold'>   My Community</h6>
              </div>
              </Link>
              ):null}
            </li>
            
      </ul>
    </div>
   
  </div>
  
  <div className="flex-1">
<Link to="/dashboard" className=' btn-link '>
  <img src='/assets/CORPO_CIM/CIM_2024.png' className='h-auto w-24 sm:28 md:32 lg:32 xl:32  mt-1 mx-0 '/>
  </Link>
  </div>
  <div className="flex flex-auto justify-start relative left-10 hidden lg:block">
  <img src='/assets/CORPO_CIM/CSCQ_PLAIN_CUT_WHITE.png' className=' h-full w-96  mt-1 mx-0 flex justify-center align-middle '/>
  </div>
 
  <div className="flex flex-row">
  <div className="indicator">
            {totalUnreadCount > 0 && (
              <span className="indicator-item indicator-start badge badge-secondary bg-yellow-200">{totalUnreadCount}</span>
            )}
            <button className="btn btn-success mx-1 dropdown text-gray-500 dropdown-end btn-sm btn-circle"
            onClick={resetUnreadCount}>
              <div tabIndex={0} role="button" className="indicator m-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" data-tip="Notif" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-3 mt-2 mr-0 shadow bg-base-100 rounded-box w-52">
                <NotificationBell setTotalUnreadCount={setTotalUnreadCount}/>
              </ul>
            </button>
          </div>
          <div className="indicator">
            {totalUnreadMessages > 0 && (
              <span className="indicator-item indicator-start badge badge-secondary bg-yellow-200">{totalUnreadMessages}</span>
            )}
            <button className="btn btn-success mx-1 dropdown dropdown-end btn-sm btn-circle"
            onClick={resetUnreadMessageCount}>
              <div tabIndex={0} role="button" className="indicator m-1">
                <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-yellow-400" data-tip="Messages" />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-3 mt-2 mr-0 shadow bg-base-100 rounded-box w-52">
                <MessageDropdown setTotalUnreadMessages={setTotalUnreadMessages} />
              </ul>
            </button>
          </div>

    <div className="dropdown dropdown-end  ">
      
      <a tabIndex={0} role="button" className="btn btn-ghost btn-md text-s text-white">{userName}</a>
      <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 mr-5 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-white">
        <li>
          <div className="relative grid select-none items-center whitespace-nowrap rounded-lg py-1.5 px-3 font-sans text-xs font-bold uppercase text-white">
            <div className="absolute top-2/4 left-1.5 h-5 w-5 -translate-y-2/4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  clipRule="evenodd"></path>
              </svg>
            </div>
          <span className="ml-[18px]">{adminType}</span>
  </div>
  </li>
      
          <li></li>
          <li onClick={handleLogout} className='bg-red-600 rounded-lg flex items-center'>
                <a>Logout 
                  <svg className="text-white"  width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"> 
                    <path stroke="none" d="M0 0h24v24H0z"/> 
                    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /> 
                    <path d="M7 12h14l-3 -3m0 6l3 -3" /> 
                  </svg>
                </a>
          </li>
      </ul>
    </div>
   
    
  
  </div>
       
        </div>
       
       
    </nav>
  )
}
export default Navbar_2