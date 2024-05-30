import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className='flex flex-row justify-between shadow-2xl'>
      <div className="flex flex-row justify-self-center">
      <img src='../src/assets/CORPO_CIM/CORPO SIDE.png' className=' mt-7 mx-3 h-auto w-40'></img>
      </div>
      
      <div className="links">
        <Link to="/" className='btn  btn-ghost btn-warning text-yellow-200 font-semibold italic'>Home</Link>
        <Link to="/login" className='btn  btn-ghost btn-warning text-yellow-200 font-semibold italic'>Login</Link>
      </div>
      
    </nav>
  );
}
