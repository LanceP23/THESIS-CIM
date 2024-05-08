import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MyCommunit.css'; 

export default function MyCommunity() {
  const navigate = useNavigate();

  const handleBuildCommunity = () => {
    navigate('/build-community');
  };

  const handleViewCommunity = () => {
    navigate('/view-community');
  };
  
  return (
    <div className="my-community-container">
      <h1>Welcome to the Community Management Module</h1>
      <div className="button-container"> 
        <button className="build-button" onClick={handleBuildCommunity}>Build a Community</button> 
        <button className="view-button" onClick={handleViewCommunity}>View Your Community</button> 
      </div>
    </div>
  );
}
