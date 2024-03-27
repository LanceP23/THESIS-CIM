import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

export default function OrganizationReg() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newOrganization, setNewOrganization] = useState({
    organizationName: '',
    schoolYear: '',
    semester: ''
  });

  // Fetch admin type from localStorage
  const adminType = localStorage.getItem('adminType');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/organization');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
    }
  };

  const handleInputChange = (e) => {
    setNewOrganization({
      ...newOrganization,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Retrieve token from cookie
      const token = getCookie('token');
      const response = await axios.post('http://localhost:8000/create_organization', newOrganization, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 200) {
        toast.success('Organization created successfully');
        setNewOrganization({
          organizationName: '',
          schoolYear: '',
          semester: ''
        });
        setShowModal(false);
        fetchOrganizations(); // Refresh the list of organizations
      } else {
        toast.error('Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    }
  };

  // Function to get cookie value by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleManageOfficers = (orgId) => {
    navigate(`/organization/${orgId}/officers`);
  };

  return (
    <div>
      <Sidebar adminType={adminType} /> 
      <h2>Manage Organizations</h2>
      <button onClick={() => setShowModal(true)}>Add Organization</button>
      {organizations.length === 0 && <p>No organizations yet.</p>}
      <div className={`modal ${showModal ? 'show' : ''}`}>
        <div className="modal-content">
          <span className="close" onClick={() => setShowModal(false)}>&times;</span>
          <h2>Create a School Organization</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="organizationName">Organization Name:</label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={newOrganization.organizationName}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="schoolYear">School Year:</label>
            <input
              type="text"
              id="schoolYear"
              name="schoolYear"
              value={newOrganization.schoolYear}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="semester">Semester:</label>
            <input
              type="text"
              id="semester"
              name="semester"
              value={newOrganization.semester}
              onChange={handleInputChange}
              required
            />

            <button type="submit">Create Organization</button>
          </form>
        </div>
      </div>
      {organizations.length > 0 && (
        <table className="organization-table">
          <thead>
            <tr>
              <th>Organization Name</th>
              <th>School Year</th>
              <th>Semester</th>
              <th>Members</th>
              <th>Manage Officers</th> 
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org._id}>
                <td>{org.name}</td>
                <td>{org.schoolYear}</td>
                <td>{org.semester}</td>
                <td>
                <button onClick={() => handleShowMembers(org._id)}>Show Members</button>
                </td>
                <td>
                  <button onClick={() => handleManageOfficers(org._id)}>Manage Officers</button> 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
