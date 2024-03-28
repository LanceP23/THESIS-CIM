import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function Sidebar({ adminType }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
  }, [adminType]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      localStorage.removeItem('token');
      toast.success('Logout Successful.');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed: ', error);
      toast.error('Logout failed.');
    }
  };

  

  return (
    <div>
      <button className="toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <ul>
            <li>
              <Link to="/dashboard" onClick={closeSidebar}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/createorg" onClick={closeSidebar}>
                Manage Organization
              </Link>
            </li>
            {adminType === 'School Owner' || adminType === 'Student Government' || adminType === 'Organization Officer' ? (
              <li>
                <Link to="/createannouncement" onClick={closeSidebar}>
                  Manage Post
                </Link>
              </li>
            ) : null}
            <li>
              {adminType === 'School Owner'?(
                <Link to="/register">Register Admin Account</Link>
              ):null}
            </li>
          </ul>
        </div>
        <div className="logout-container">
          <button onClick={handleLogout}>
            <span role="img" aria-label="logout">
              🚪
            </span>{' '}
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
