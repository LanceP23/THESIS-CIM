import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; 
import './UserManagement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobile} from '@fortawesome/free-solid-svg-icons';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('All');
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUserData, setEditedUserData] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/mobile-users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users'); 
        }
    };

    // Filter users based on search term and selected filter option
    const filteredUsers = users.filter(user => {
        if (filterOption === 'All') {
            return user.name.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
            return user.educationLevel === filterOption && user.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
    });

    const handleEdit = (userId) => {
        setEditingUserId(userId);
        const userToEdit = users.find(user => user._id === userId);
        setEditedUserData(userToEdit);
    };

    const handleSave = async () => {
        try {
            await axios.put(`/update-mobile-users/${editingUserId}`, editedUserData);
            setEditingUserId(null);
            fetchUsers(); // Refresh the user list after saving changes
            toast.success('User updated successfully'); 
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user'); 
        }
    };

    const handleDelete = async (userId) => {
        try {
            await axios.delete(`/delete-mobile-users/${userId}`);
            fetchUsers(); // Refresh the user list after deletion
            toast.success('User deleted successfully'); 
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user'); 
        }
    };

    return (
      
        <div className=" mr-4 ml-14 mt-16 pt-2 ">
          {/* Main Container */}
          <div className="bg-slate-200 rounded-2xl shadow-lg p-7 animate-fade-in  ">
            {/* Header */}
            <h2 className="text-3xl font-semibold text-green-800  border-b-4 border-yellow-500 pb-2 mb-6 text-left">
            <FontAwesomeIcon icon={faMobile} className="text-yellow-500 ml-2 text-3xl" /> Mobile User Management
            </h2>
      
            {/* Filters Section */}
            <div className="flex gap-6 justify-center mb-6 m">
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input input-bordered input-md w-1/2 dark:text-white dark:bg-gray-800 rounded-lg shadow-lg"
              />
      
              {/* Filter Select */}
              <select
                value={filterOption}
                onChange={e => setFilterOption(e.target.value)}
                className="select select-bordered select-md w-1/3 dark:text-white dark:bg-gray-800 rounded-lg"
              >
                <option value="All">All</option>
                <option value="Grade School">Grade School</option>
                <option value="High School">High School</option>
                <option value="Senior High School">Senior High School</option>
                <option value="College">College</option>
              </select>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-5">
      
            {/* User Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ease-in-out duration-300"
                >
                  {/* User Profile Picture */}
                  <div className="flex justify-center mb-4">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-24 h-24 rounded-full border-4 border-green-500 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-white text-2xl">
                        {user.name[0]}
                      </div>
                    )}
                  </div>
      
                  {/* User Details */}
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {user._id === editingUserId ? (
                        <input
                          type="text"
                          value={editedUserData.name}
                          onChange={(e) => setEditedUserData({ ...editedUserData, name: e.target.value })}
                          className="input input-bordered input-md w-full dark:text-white dark:bg-gray-700 rounded-lg shadow-md"
                        />
                      ) : (
                        user.name
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user._id === editingUserId ? (
                        <input
                          type="text"
                          value={editedUserData.studentemail}
                          onChange={(e) => setEditedUserData({ ...editedUserData, studentemail: e.target.value })}
                          className="input input-bordered input-md w-full dark:text-white dark:bg-gray-700 rounded-lg shadow-md"
                        />
                      ) : (
                        user.studentemail
                      )}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          user.educationLevel === 'Grade School'
                            ? 'bg-blue-600'
                            : user.educationLevel === 'High School'
                            ? 'bg-green-600'
                            : user.educationLevel === 'Senior High School'
                            ? 'bg-indigo-600'
                            : 'bg-amber-600'
                        }`}
                      >
                        {user.educationLevel}
                      </span>
                    </div>
                  </div>
      
                  {/* Additional Details Section */}
                  <div className="mb-4">
                    {user.educationLevel === 'Grade School' && (
                      <div className="text-sm text-blue-600">
                        <p>Grade Level: {user.gradeLevel}</p>
                        <p>Section: {user.section}</p>
                        <p>Subjects: {user.subjects.join(', ')}</p>
                      </div>
                    )}
                    {user.educationLevel === 'High School' && (
                      <div className="text-sm text-green-600">
                        <p>Year Level: {user.highSchoolYearLevel}</p>
                        <p>Section: {user.section}</p>
                        <p>Subjects: {user.subjects.join(', ')}</p>
                      </div>
                    )}
                    {user.educationLevel === 'Senior High School' && (
                      <div className="text-sm text-indigo-600">
                        <p>Year Level: {user.seniorHighSchoolYearLevel}</p>
                        <p>Strand: {user.shsStrand}</p>
                        <p>Section: {user.section}</p>
                        <p>Subjects: {user.subjects.join(', ')}</p>
                      </div>
                    )}
                    {user.educationLevel === 'College' && (
                      <div className="text-sm text-amber-600">
                        <p>Year Level: {user.collegeYearLevel}</p>
                        <p>Course: {user.collegeCourse}</p>
                        <p>Subjects: {user.subjects.join(', ')}</p>
                      </div>
                    )}
                  </div>
      
                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    {user._id === editingUserId ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="btn btn-sm btn-success"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="btn btn-sm btn-error"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user._id)}
                          className="btn btn-sm btn-success"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="btn btn-sm btn-error"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      );
      
};

export default UserManagement;
