import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function MyCommunity() {
  const navigate = useNavigate();

  const handleBuildCommunity = () => {
    navigate('/build-community');
  };

  const handleViewCommunity = () => {
    navigate('/view-community');
  };
  return (
    
    <div>
       
      <h1>Welcome to the Community Management Module</h1>
      <button onClick={handleBuildCommunity}>Build a Community</button>
      <button onClick={handleViewCommunity}>View Your Community</button>
    
    </div>
  )
}
