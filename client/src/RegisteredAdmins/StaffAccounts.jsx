import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateUser from './UpdateAdmin';
import DeleteUser from './DeleteAdmin';
import './RegisteredAdmins.css'

const StaffAccounts = () => {
  const [staffAccounts, setStaffAccounts] = useState([]);

  useEffect(() => {
    fetchStaffAccounts();
  }, []);

  const fetchStaffAccounts = async () => {
    try {
      const response = await axios.get('/staff'); // Fetch staff accounts from the backend
      setStaffAccounts(response.data);
    } catch (error) {
      console.error('Error fetching staff accounts:', error);
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setStaffAccounts(staffAccounts.map(user => (user._id === updatedUser._id ? updatedUser : user)));
  };

  const handleDeleteUser = (userId) => {
    setStaffAccounts(staffAccounts.filter(user => user._id !== userId));
  };

  return (
    <div>
      <h2>Staff Accounts</h2>
      <ul>
        {staffAccounts.map(user => (
          <li key={user._id}>
            <div>
              <strong>Name:</strong> {user.name}
            </div>
            <div>
              <strong>Email:</strong> {user.studentemail}
            </div>
            <div>
                <strong>Admin Type: </strong>{user.adminType}
            </div>
            <UpdateUser user={user} onUpdate={handleUpdateUser} />
            <DeleteUser userId={user._id} onDelete={handleDeleteUser} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffAccounts;