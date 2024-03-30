import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateUser from './UpdateAdmin';
import DeleteUser from './DeleteAdmin';

const FacultyAccounts = () => {
  const [facultyAccounts, setFacultyAccounts] = useState([]);

  useEffect(() => {
    fetchFacultyAccounts();
  }, []);

  const fetchFacultyAccounts = async () => {
    try {
      const response = await axios.get('/faculty'); // Fetch faculty accounts from the backend
      setFacultyAccounts(response.data);
    } catch (error) {
      console.error('Error fetching faculty accounts:', error);
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setFacultyAccounts(facultyAccounts.map(user => (user._id === updatedUser._id ? updatedUser : user)));
  };

  const handleDeleteUser = (userId) => {
    setFacultyAccounts(facultyAccounts.filter(user => user._id !== userId));
  };

  return (
    <div>
      <h2>Faculty Accounts</h2>
      <ul>
        {facultyAccounts.map(user => (
          <li key={user._id}>
            <div>
              <strong>Name:</strong> {user.name}
            </div>
            <div>
              <strong>Email:</strong> {user.studentemail}
            </div>
            <div>
              <strong>Admin Type:</strong> {user.adminType}
            </div>
            <div>
                <strong>Department:</strong> {user.department}
            </div>
            <UpdateUser user={user} onUpdate={handleUpdateUser} />
            <DeleteUser userId={user._id} onDelete={handleDeleteUser} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FacultyAccounts;
