import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'

export default function Navbar() {
  return (
<<<<<<< Updated upstream
    <nav>
      <div className="logo">
=======
    <nav className='flex flex-row justify-between shadow-2xl'>
      <div className="flex flex-row justify-self-center">
      <img src='/assets/CORPO_CIM/CIM_2024.png' className=' mt-1 mx-3 h-auto w-32   '></img>
>>>>>>> Stashed changes
      </div>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}
