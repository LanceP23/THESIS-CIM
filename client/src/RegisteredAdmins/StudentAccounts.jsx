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

<h2 className='text-lg border-b-2 border-warning text-gray-700 font-semibold'>Student Accounts</h2>

<div className=" max-h-96 w-full overflow-auto ">

<table className="w-full bg-white shadow-2xl rounded-2xl ">
    {/* Table Header */}
    <thead className='sticky top-0'>
      <tr>
        <th className="bg-green-700 text-white">Name</th>
        <th className="bg-green-700 text-white">Email</th>
        <th className="bg-green-700 text-white">Admin Type </th>
        <th className="bg-green-700 text-white">Organization </th>
    
        <th className="bg-green-700 text-white">UPDATE/DELETE USER</th>
      </tr>
    </thead>
    {/* Table Body */}
    <tbody>
    {studentAccounts.map((user, index) => (
        <tr key={user._id}  className={` hover:bg-customyellow ${index % 2 === 0 ? 'bg-gray-200' : 'bg-green-100'}`}>
          <td className="border px-4 py-2 text-base-200">{user.name}</td>
          <td className="border px-4 py-2 text-base-200"> {user.studentemail}</td>
          <td className="border px-4 py-2 text-base-200">{user.adminType}</td>
          <td className="border px-4 py-2 text-base-200">
          {user.adminType === 'Student Government' && (
              <div>
                <strong>Position:</strong> {user.position}
              </div>
            )}
            {user.adminType === 'Organization Officer' && (
              <div className=''>
                <strong>Organization:</strong> {user.organization}
                <br />
                <strong>Position:</strong> {user.position}
              </div>
            )}
            
          </td>
          <td className="border px-4 py-2">
          <UpdateUser user={user} onUpdate={handleUpdateUser} />
          <DeleteUser userId={user._id} onDelete={handleDeleteUser} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>

 
      
      </div>
      
      
    
    </div>
  );
};

export default StudentAccounts;
