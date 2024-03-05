import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({adminType}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
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
              <Link to="/dashboard" onClick={closeSidebar}>Dashboard</Link>
            </li>
            {adminType !== 'Student Government'&&(
            <li>
              <Link to="/createorg" onClick={closeSidebar}>Create Organization</Link>
            </li>
            )}
            
          </ul>
        </div>
        <div className="logout-container">
          <Link to="/" onClick={closeSidebar}>
            <span role="img" aria-label="logout">🚪</span> Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
