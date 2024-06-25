import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; 
import './UserManagement.css';

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
        <div className="bg-slate-200 rounded-xl my-5 p-2 animate-fade-in">
            <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2 mb-3'>Mobile User Management</h2>
            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='input input-success input-sm text-white mx-4 shadow-md mb-3'
                />
                <select value={filterOption} onChange={e => setFilterOption(e.target.value)} className='select select-success select-sm text-white w-full max-w-xs'>
                    <option value="All">All</option>
                    <option value="Grade School">Grade School</option>
                    <option value="High School">High School</option>
                    <option value="Senior High School">Senior High School</option>
                    <option value="College">College</option>
                </select>
            </div>

            <div className="w-full max-h-96 overflow-auto">
            <table>
                <thead className=' sticky top-0 z-10'>
                    <tr className=''>
                        <th className='bg-green-700 text-white text-left '>ID</th>
                        <th className='bg-green-700 text-white text-left'>Name</th>
                        <th className='bg-green-700 text-white text-left '>Email</th>
                        <th className='bg-green-700 text-white text-left'>Education Level</th>
                        <th className='bg-green-700 text-white z-10 '>Additional Details</th>
                        <th className='bg-green-700 text-white text-left '>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {filteredUsers.map((user, index) => (
          <tr key={user._id} className={index % 2 === 0 ? 'bg-gray-200' : 'bg-customyellow'}>
            <td>{user._id}</td>
            <td>
              {user._id === editingUserId ? (
                <input
                  type="text"
                  value={editedUserData.name}
                  onChange={(e) => setEditedUserData({ ...editedUserData, name: e.target.value })}
                  className='input input-bordered input-success input-sm w-full text-white bg-base rounded-md shadow-xl'
                />
              ) : (
                user.name
              )}
            </td>
            
            <td>
              {user._id === editingUserId ? (
                <input
                  type="text"
                  value={editedUserData.studentemail}
                  onChange={(e) => setEditedUserData({ ...editedUserData, studentemail: e.target.value })}
                  className='input input-bordered input-success input-sm w-full text-white bg-base rounded-md shadow-xl'
                />
              ) : (
                user.studentemail
              )}
            </td>
            <td>
              {user._id === editingUserId ? (
                <input
                  type="text"
                  value={editedUserData.educationLevel}
                  onChange={(e) => setEditedUserData({ ...editedUserData, educationLevel: e.target.value })}
                  className='input input-bordered input-success input-sm w-full text-white bg-base rounded-md shadow-xl'
                />
              ) : (
                user.educationLevel
              )}
            </td>
                            <td className='z-'>
                                {user.educationLevel === 'Grade School' && (
                                    <div className=' '>
                                        <div className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-blue-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white w-fit z-1">
                                            <span className="">Grade Level: {user.gradeLevel}</span>
                                         </div>
                                        <h2>Section: {user.section}</h2>
                                        <h2>Subjects Enrolled: {user.subjects.join(', ')}</h2>
                                    </div>
                                )}
                                {user.educationLevel === 'High School' && (
                                    <div className=''>
                                        <div className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-green-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white w-fit z-1">
                                            <span className="">Year Level: {user.highSchoolYearLevel}</span>
                                        </div>
                                        <h2>Section: {user.section}</h2>
                                        <h2>Subjects Enrolled: {user.subjects.join(', ')}</h2>
                                    </div>
                                )}
                                {user.educationLevel === 'Senior High School' && (
                                    <div  className=''>
                                         <div
                                            className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-indigo-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white w-fit z-1 ">
                                            <span className="">Year Level: {user.seniorHighSchoolYearLevel}</span>
                                        </div>
                                        <h2>Strand: {user.shsStrand}</h2>
                                        <h2>Section: {user.section}</h2>
                                        <h2>Subjects Enrolled: {user.subjects.join(', ')}</h2>
                                    </div>
                                )}
                                {user.educationLevel === 'College' && (
                                    <div className=''>
                                        <div className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-amber-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white w-fit z-1">
                                            <p className="">Year Level: {user.collegeYearLevel}</p>
                                        </div>
                                        <h2>Course: {user.collegeCourse}</h2>
                                        <h2>Subjects Enrolled: {user.subjects.join(', ')}</h2>
                                    </div>
                                )}
                            </td>
                            <td>
                                {user._id === editingUserId ? (
                                    <>
                                        <button onClick={handleSave} className='btn btn-success btn-xs '>Save</button>
                                        <button onClick={() => setEditingUserId(null)} className='btn btn-error btn-xs'>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(user._id)} className='btn btn-success btn-xs '>Edit</button>
                                        <button onClick={() => handleDelete(user._id)} className='btn btn-error btn-xs'>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default UserManagement;
