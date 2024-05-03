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
        <div className="user-management">
            <h2>Mobile User Management</h2>
            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select value={filterOption} onChange={e => setFilterOption(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Grade School">Grade School</option>
                    <option value="High School">High School</option>
                    <option value="Senior High School">Senior High School</option>
                    <option value="College">College</option>
                </select>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Education Level</th>
                        <th>Additional Details</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user._id}>
                            <td>{user._id === editingUserId ? <input type="text" value={editedUserData.name} onChange={(e) => setEditedUserData({...editedUserData, name: e.target.value})} /> : user.name}</td>
                            <td>{user._id}</td>
                            <td>{user._id === editingUserId ? <input type="text" value={editedUserData.studentemail} onChange={(e) => setEditedUserData({...editedUserData, studentemail: e.target.value})} /> : user.studentemail}</td>
                            <td>{user._id === editingUserId ? <input type="text" value={editedUserData.educationLevel} onChange={(e) => setEditedUserData({...editedUserData, educationLevel: e.target.value})} /> : user.educationLevel}</td>
                            <td>
                                {user.educationLevel === 'Grade School' && (
                                    <>
                                        <div>Grade Level: {user.gradeLevel}</div>
                                        <div>Section: {user.section}</div>
                                        <div>Subjects Enrolled: {user.subjects.join(', ')}</div>
                                    </>
                                )}
                                {user.educationLevel === 'High School' && (
                                    <>
                                        <div>Year Level: {user.highSchoolYearLevel}</div>
                                        <div>Section: {user.section}</div>
                                        <div>Subjects Enrolled: {user.subjects.join(', ')}</div>
                                    </>
                                )}
                                {user.educationLevel === 'Senior High School' && (
                                    <>
                                        <div>Strand: {user.shsStrand}</div>
                                        <div>Year Level: {user.seniorHighSchoolYearLevel}</div>
                                        <div>Grade Level: {user.gradeLevel}</div>
                                        <div>Section: {user.section}</div>
                                        <div>Subjects Enrolled: {user.subjects.join(', ')}</div>
                                    </>
                                )}
                                {user.educationLevel === 'College' && (
                                    <>
                                        <div>Course: {user.collegeCourse}</div>
                                        <div>Year Level: {user.collegeYearLevel}</div>
                                        <div>Subjects Enrolled: {user.subjects.join(', ')}</div>
                                    </>
                                )}
                            </td>
                            <td>
                                {user._id === editingUserId ? (
                                    <>
                                        <button onClick={handleSave}>Save</button>
                                        <button onClick={() => setEditingUserId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(user._id)}>Edit</button>
                                        <button onClick={() => handleDelete(user._id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
