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
    setFacultyAccounts((prevAccounts) => 
        prevAccounts.map((user) =>
            user._id === updatedUser._id ? {...user, ...updatedUser} : user
        )
    );
};

const handlePictureUpdate = (userId, pictureUrl) => {
  setFacultyAccounts((prevAccounts) => 
    prevAccounts.map((user) => 
      user._id === userId ? { ...user, profilePicture: pictureUrl } : user
    )
  );
};



  const handleDeleteUser = (userId) => {
    setFacultyAccounts(facultyAccounts.filter(user => user._id !== userId));
  };

  return (
    <div>

<h2 className='text-lg border-b-2 border-warning text-gray-700 font-semibold'>Faculty Accounts</h2>

<div className=" max-h-96 overflow-auto ">

<table className="w-full bg-white shadow-2xl rounded-2xl ">
    {/* Table Header */}
    <thead className='sticky top-0'>
      <tr>
        <th className="bg-green-700 text-white">Name</th>
        <th className="bg-green-700 text-white">Email</th>
        <th className="bg-green-700 text-white">Admin Type </th>
        
        <th className="bg-green-700 text-white">Department </th>
        <th className="bg-green-700 text-white">UPDATE/DELETE USER</th>
      </tr>
    </thead>
    {/* Table Body */}
    <tbody>
    {facultyAccounts.map((user, index) => (
        <tr key={user._id}  className={` hover:bg-customyellow ${index % 2 === 0 ? 'bg-gray-200' : 'bg-green-100'}`}>
          <td className="border px-4 py-2 text-black">{user.name}</td>
          <td className="border px-4 py-2 text-black"> {user.studentemail}</td>
          <td className="border px-4 py-2 text-black">{user.adminType}</td>
          <td className="border px-4 py-2 text-black">{user.department}</td>
          <td className="border px-4 py-2">
          <UpdateUser user={user} 
  onUpdate={handleUpdateUser} 
  onPictureUpdate={handlePictureUpdate} />
          <DeleteUser user={user} onDelete={handleDeleteUser} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>

 
      
      </div>
    </div>
  );
};

export default FacultyAccounts;
