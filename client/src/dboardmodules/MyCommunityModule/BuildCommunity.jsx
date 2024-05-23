import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function BuildCommunity() {
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [mobileUsers, setMobileUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [mobileUserFilter, setMobileUserFilter] = useState('');
  const [adminUserFilter, setAdminUserFilter] = useState('');

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  useEffect(() => {
    // Fetch mobile users
    const fetchMobileUsers = async () => {
      try {
        const response = await axios.get('/get-mobile-users');
        setMobileUsers(response.data);
      } catch (error) {
        console.error('Error fetching mobile users:', error);
      }
    };

    // Fetch admin/users
    const fetchAdminUsers = async () => {
      try {
        const response = await axios.get('/get-users');
        setAdminUsers(response.data);
      } catch (error) {
        console.error('Error fetching admin/users:', error);
      }
    };

    fetchMobileUsers();
    fetchAdminUsers();
  }, []);

  // Filter mobile users based on input value
  const filteredMobileUsers = mobileUsers.filter(user => {
    return (
      user.name.toLowerCase().includes(mobileUserFilter.toLowerCase()) ||
      user.studentemail.toLowerCase().includes(mobileUserFilter.toLowerCase())
    );
  });

  // Filter admin/users based on input value
  const filteredAdminUsers = adminUsers.filter(user => {
    return (
      user.name.toLowerCase().includes(adminUserFilter.toLowerCase()) ||
      user.studentemail.toLowerCase().includes(adminUserFilter.toLowerCase()) ||
      user.adminType.toLowerCase().includes(adminUserFilter.toLowerCase())
    );
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Check if name and description are provided
    if (!communityName || !communityDescription) {
        toast.error('Community name and description are required.');
      return;
    }
  
    // Fetch mobile and admin users
    try {
      const [mobileUsersResponse, adminUsersResponse] = await Promise.all([
        axios.get('/get-mobile-users'),
        axios.get('/get-users')
      ]);
  
      // Extract data from responses
      const mobileUsersData = mobileUsersResponse.data;
      const adminUsersData = adminUsersResponse.data;
  
      // Create FormData object to append logo and description
      const formData = new FormData();
      formData.append('name', communityName);
      formData.append('description', communityDescription);
      if (logoFile) {
        formData.append('logo', logoFile);
      }
  
      // Check if selectedMembers is an array
      if (!Array.isArray(selectedMembers)) {
        toast.error('Selected members must be an array.');
        return;
      }
  
      // Generate members array using both mobile and admin users
      const members = [];

      // Iterate over selected members and push objects into the members array
      selectedMembers.forEach(userId => {
        const user = mobileUsersData.find(user => user._id === userId) || adminUsersData.find(user => user._id === userId);
        if (user && user.adminType) {
          members.push({ userId, userType: 'User',adminType: user.adminType, name: user.name });
        } else {
          members.push({ userId, userType: 'MobileUser', name: user.name });
        }
      });
  
      // Determine the onModel value
      const onModel = members.some(member => member.userType === 'MobileUser') ? 'MobileUser' : 'User';
  
      // Append members array to formData
      formData.append('members', JSON.stringify(members));
  
      // Append onModel value to formData
      formData.append('onModel', onModel);
  
  
      const token = getToken();
      const response = await axios.post('/build-community', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      // Reset form fields
      setCommunityName('');
      setCommunityDescription('');
      setLogoFile(null);
      setSelectedMembers([]);
      toast.success('Community created successfully.');
    } catch (error) {
      toast.error('Error creating community. Please try again later.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddMember = (userId) => {
    // Check if the user is already selected
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(id => id !== userId));
  };

  const handleLogoUpload = (file) => {
    setLogoFile(file);
  };

  return (
    <div className=" bg-slate-200 my-5 rounded-xl p-3">
    <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2 my-2'>Build Community</h2>
      <div className="flex flex-row">
      
      <form className=" border-2 border-green-400 w-full max-w-lg mt-4 bg-gradient-to-r from-white to-green-200 p-2 rounded-lg shadow-2xl text-left" onSubmit={handleSubmit}>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label htmlFor="communityName" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Community Name:</label>
            <input
              type="text"
              id="communityName"
              className="input input-bordered input-success input-md w-full text-gray-700 bg-slate-100 rounded-md shadow-xl"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label htmlFor="logo" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Logo (Upload Picture):</label>
            <input
              type="file"
              id="logo"
              accept="image/*"
              className="file-input file-input-bordered file-input-success file-input-sm w-full max-w-xs mx-5 bg-white rounded-md shadow-xl"
              onChange={(e) => handleLogoUpload(e.target.files[0])}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label htmlFor="communityDescription" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Description:</label>
            <textarea
              id="communityDescription"
              className="textarea textarea-success w-full text-gray-700 bg-white rounded-md shadow-xl"
              rows="4"
              value={communityDescription}
              onChange={(e) => setCommunityDescription(e.target.value)}
              placeholder="Add description..."
            />
          </div>
        </div>
        <button type="submit" className="btn btn-success btn-wide">Create Community</button>
      </form>

      <div className="divider lg:divider-horizontal divider-warning"></div> 

      {/* Add Mobile Members */}
      <div className="w-full  mt-8">
        <h2 className="text-lg font-bold mb-4">Add Mobile Members</h2>
        <input
          type="text"
          className="input input-bordered input-success input-md w-full text-white bg-base-100 rounded-md shadow-xl"
          value={mobileUserFilter}
          onChange={(e) => setMobileUserFilter(e.target.value)}
          placeholder="Filter by name or email"
        />
        <div className="w-full max-h-96 overflow-auto">
        <table className="w-full bg-white shadow-2xl rounded-2xl ">
          {/* Table Header */}
          <thead className='sticky top-0'>
            <tr>
              <th className="bg-green-700 text-white">ID</th>
              <th className="bg-green-700 text-white">Name</th>
              <th className="bg-green-700 text-white">Email</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {filteredMobileUsers.map(user => (
              <tr key={user._id} onClick={() => handleAddMember(user._id)} className="cursor-pointer hover:bg-customyellow">
                <td className="border px-4 py-2">{user._id}</td>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.studentemail}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      </div>

      <div className="divider divider-warning"></div>

      {/* Add Admin/Users */}
      <div className="w-full  mt-8 ">
        <h2 className="text-lg font-bold mb-4">Add Admin/Users</h2>

        
        <input
          type="text"
          className="input input-bordered input-success input-md w-full text-white bg-base-100 rounded-md shadow-xl "
          value={adminUserFilter}
          onChange={(e) => setAdminUserFilter(e.target.value)}
          placeholder="Filter by name, email, or admin type"
        />

        <div className="max-h-96 overflow-auto">
        <table className="w-full bg-white shadow-2xl rounded-2xl ">
          {/* Table Header */}
          <thead className='sticky top-0'>
            <tr>
              <th className="bg-green-700 text-white">ID</th>
              <th className="bg-green-700 text-white">Name</th>
              <th className="bg-green-700 text-white">Email</th>
              <th className="bg-green-700 text-white">Admin Type</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {filteredAdminUsers.map(user => (
              <tr key={user._id} onClick={() => handleAddMember(user._id)} className="cursor-pointer hover:bg-customyellow">
                <td className="border px-4 py-2">{user._id}</td>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.studentemail}</td>
                <td className="border px-4 py-2">{user.adminType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      <div className="divider divider-warning"></div>

      {/* Selected Members */}
      <div className="w-full max-w-lg mt-8">
        <div className="flex flex-row justify-between">
        <h2 className="text-lg font-bold mb-4">Selected Members</h2>
        <button onClick={() => setSelectedMembers([])} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Remove All</button>
        </div>
        <div className="div">
          <table>
            <thead>
              <tr>
              <th className=' bg-green-700 text-white'>Name</th>
              <th className=' bg-green-700 text-white'>Admin Type</th>
              <th className=' bg-green-700 text-white'>Admin Type</th>
              </tr>
            </thead>

            
            {selectedMembers.map(userId => {
            const user = mobileUsers.find(user => user._id === userId) || adminUsers.find(user => user._id === userId);
            return (
              <tbody key={userId} className="flex items-center justify-between border-b py-2">
                 {user && (
                <tr>
                <td> {user.name} </td>
                <td>  {user.adminType || "Mobile User"} </td>
                <td>
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveMember(userId); }} className="btn btn-sm btn-error">Remove</button>
                </td>
                </tr>
               
                )}
              </tbody>
               );
              })}
        
          </table>
        </div>
        
        <div className="bg-gradient-to-r from-white to-green-500 p-2 rounded-lg">
        
        <div className="bg-gradient-to-r from-white to-green-200 px-2">
          {selectedMembers.map(userId => {
            const user = mobileUsers.find(user => user._id === userId) || adminUsers.find(user => user._id === userId);
            return (
              <li key={userId} className="flex items-center justify-between  py-3 border-b-2 border-gray-500">
                {user && (
                  <div>
                    <strong>Name:</strong> {user.name} | <strong>Admin Type:</strong> {user.adminType || "Mobile User"}
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleRemoveMember(userId); }} className="btn btn-sm btn-error">Remove</button>
              </li>
            );
          })}

        </div>
        </div>
        
        
      </div>

      <div className="flex justify-end items-end">
      <button className="btn btn-error btn-wide  text-white font-bold py-2 px-4 rounded mt-4 " onClick={handleBack}>
        &lt; Back
      </button>
      </div>
    </div>
  );
}
