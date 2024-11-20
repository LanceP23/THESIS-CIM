import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { UserContext } from '../../context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SidebarContext } from '../../context/SidebarContext';
import {
  faHamburger,
  faHome,
  faPeopleArrows,
  faChartBar,
  faComment,
  faLock,
  faBullhorn,
  faAddressCard,
  faRightFromBracket,
  faCalendarCheck,
  faGroupArrowsRotate,
  faMobile,

 
} from '@fortawesome/free-solid-svg-icons';

const Sidebar2 = () => {
  const { user } = useContext(UserContext);
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const adminType = user ? user.adminType : null;
  const [isOpen, setIsOpen] = useState(true); // Initially open the sidebar
  const navigate = useNavigate();
  const userName = user ? user.name : '';
  const profilePicture = user && user.profilePicture 
    ? user.profilePicture 
    : 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp';

  


  useEffect(() => {
    setIsOpen(false);
  }, [adminType]);


  

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      localStorage.removeItem('token');
      toast.success('Logout Successful.');

      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } catch (error) {
      console.error('Logout failed: ', error);
      toast.error('Logout failed.');
    }
  };
   // Render the sidebar only if the user is logged in
   if (!user) {
    return null;
  }

  

  return (

    
    <div className={`fixed z-20 h-full transition-width duration-300 ${isSidebarOpen ? 'w-64' : 'w-10'} bg-green-950 text-white flex flex-col overflow-hidden`}>
     

      {/* Sidebar Links */}
      <div className="flex flex-col  ">
        <ul className="  ">
         <li className='hover:text-white transition-all duration-200 p-2 py-3 hover:bg-green-700 hover:pl-6'> 
          <SidebarLink to="/dashboard" label="Dashboard" icon={faHome} isSidebarOpen={isSidebarOpen}   />
          </li>
         <li className='hover:text-white transition-all duration-200 p-2 py-3  hover:bg-green-700 hover:pl-6'>
          <SidebarLink to="/createannouncement" label="Post Management" icon={faBullhorn} isSidebarOpen={isSidebarOpen}  />
          </li>
         <li className='hover:text-white transition-all duration-200 p-2 py-3 hover:bg-green-700 hover:pl-6'>
           <SidebarLink to="/event-calendar" label="Event Calendar" icon={faCalendarCheck} isSidebarOpen={isSidebarOpen}  />
           </li>
         <li className='hover:text-white transition-all duration-200 p-2 py-3 hover:bg-green-700 hover:pl-6'>
          <SidebarLink to="/analytics-report" label="Analytics Report" icon={faChartBar} isSidebarOpen={isSidebarOpen}  />
          </li>
         <li className='hover:text-white transition-all duration-200 p-2 py-3  hover:bg-green-700 hover:pl-6'>
          <SidebarLink to="/campcomms" label="Campus Comms" icon={faComment}  isSidebarOpen={isSidebarOpen}  />
          </li>

          {adminType === 'School Owner' ? (
            <>
            <li className='hover:text-white transition-all duration-200 p-2 py-3  hover:bg-green-700 hover:pl-6'>
              <SidebarLink to="/user-settings" label="Mobile User Management" icon={faMobile} isSidebarOpen={isSidebarOpen}  />
              </li>
          
            <li className='hover:text-white transition-all duration-200 p-2 py-3 hover:bg-green-700 hover:pl-6'>
              <SidebarLink to="/createorg" label="Manage Organization" icon={faPeopleArrows} isSidebarOpen={isSidebarOpen}  />
            </li>
            
              <li className='hover:text-white transition-all duration-200 p-2 py-3 hover:bg-green-700 hover:pl-6'> 
              <SidebarLink to="/register" label="Account Registration" icon={faAddressCard} isSidebarOpen={isSidebarOpen}  />
              </li>
            </>
          ) : (
            <li className='hover:text-white transition-all duration-200 p-2 py-3  hover:bg-green-700 hover:pl-6'>
              <SidebarLink to="/createorg" label="Organizations" icon={faPeopleArrows} isSidebarOpen={isSidebarOpen} />
              </li>
          )}
          {(adminType === 'School Owner' || adminType === 'Program Head') && (
        <li className="hover:text-white transition-all duration-200 p-2 py-3 hover:bg-green-700 hover:pl-6">
          <SidebarLink to="/community-landing" label="My Community" icon={faGroupArrowsRotate} isSidebarOpen={isSidebarOpen} />
        </li>
      )}
        </ul>
      </div>

      {/* Sidebar Footer (User Profile) */}
     
    </div>
  );
};

const SidebarLink = ({ to, label, icon, isSidebarOpen }) => (
  <li>
    <Link
      to={to}
      className="flex items-center space-x-4 text-yellow-500 hover:text-white transition-colors duration-200"
    >
      <FontAwesomeIcon icon={icon} />
      {isSidebarOpen && <span className="text-white font-bold">{label}</span>}
    </Link>
  </li>
);

export default Sidebar2;
