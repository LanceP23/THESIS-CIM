import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className='flex flex-row justify-between'>
      <div className="flex flex-row justify-self-center">
      <img src='../src/assets/logo.png' className=' h-auto w-28'></img>
      </div>
      
      <div className="links">
        <Link to="/" className='btn btn-outline btn-success text-white'>Home</Link>
        <Link to="/login" className='btn btn-outline btn-success text-white'>Login</Link>
      </div>
      
    </nav>
  );
}
