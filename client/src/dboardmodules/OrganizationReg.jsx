import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

export default function OrganizationReg() {
  const [organizationName, setOrganizationName] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [semester, setSemester] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
      const response = await axios.post('http://localhost:8000/create_organization', {
        organizationName,
        schoolYear,
        semester,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
  
      if (response.status === 200) {
        toast.success('Organization created successfully');
        setOrganizationName('');
        setSchoolYear('');
        setSemester('');
      } else {
        toast.error('Failed to create organization');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create organization');
    }
  };

  return (
    <div>
      <Sidebar />
      <h2>Create a School Organization</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="organizationName">Organization Name:</label>
        <input
          type="text"
          id="organizationName"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          required
        />

        <label htmlFor="schoolYear">School Year:</label>
        <input
          type="text"
          id="schoolYear"
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
          required
        />

        <label htmlFor="semester">Semester:</label>
        <input
          type="text"
          id="semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          required
        />

        <button type="submit">Create Organization</button>
      </form>
    </div>
  );
}
