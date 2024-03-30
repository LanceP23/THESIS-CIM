import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateUser from './UpdateAdmin';
import DeleteUser from './DeleteAdmin';

const StudentAccounts = () => {
  const [studentAccounts, setStudentAccounts] = useState([]);

  useEffect(() => {
    fetchStudentAccounts();
  }, []);

  const fetchStudentAccounts = async () => {
    try {
      const response = await axios.get('/students'); // Fetch student accounts from the backend
      setStudentAccounts(response.data);
    } catch (error) {
      console.error('Error fetching student accounts:', error);
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setStudentAccounts(studentAccounts.map(user => (user._id === updatedUser._id ? updatedUser : user)));
  };

  const handleDeleteUser = (userId) => {
    setStudentAccounts(studentAccounts.filter(user => user._id !== userId));
  };

  return (
    <div>
      <h2>Student Accounts</h2>
      <ul>
        {studentAccounts.map(user => (
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
            {user.adminType === 'Student Government' && (
              <div>
                <strong>Position:</strong> {user.position}
              </div>
            )}
            {user.adminType === 'Organization Officer' && (
              <div>
                <strong>Organization:</strong> {user.organization}
                <br />
                <strong>Position:</strong> {user.position}
              </div>
            )}
            <UpdateUser user={user} onUpdate={handleUpdateUser} />
            <DeleteUser userId={user._id} onDelete={handleDeleteUser} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentAccounts;
