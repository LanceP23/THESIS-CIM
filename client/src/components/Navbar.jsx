import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <div className="logo">
      </div>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}
