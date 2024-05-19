import React from 'react';
import axios from 'axios';

const DeleteUser = ({ userId, onDelete }) => {
  const handleDelete = async () => {
    try {
      await axios.delete(`/users/${user._id}/update`); 
      onDelete(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div>
      <button onClick={handleDelete} className='btn btn-xs btn-error'>Delete</button>
    </div>
  );
};

export default DeleteUser;