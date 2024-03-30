import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './register.css'

const StudentRegistration = ({ data, setData, organizations, registerAdmin }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/register', data);
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setData({
          name: '',
          studentemail: '',
          password: '',
          adminType: 'Organization Officer', // Default adminType for student registration
          organization: '',
          position: '',
          schoolYear: '',
        });
        toast.success('Student registration successful!');
      }
    } catch (error) {
      console.error('Error registering student:', error);
      toast.error('Failed to register student');
    }
  };

  return (
    <div>
      <h2>Student Registration</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type='text'
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
          className = 'input_field'
        />
        <label>Email</label>
        <input
          type='email'
          value={data.studentemail}
          onChange={(e) => setData({ ...data, studentemail: e.target.value })}
          required
          className = 'input_field'
        />
        <label>Password</label>
        <input
          type='password'
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          required
          className = 'input_field'
        />
        <label>Admin Type</label>
        <select value={data.adminType} onChange={(e) => setData({ ...data, adminType: e.target.value })}>
          <option value='Organization Officer'>Organization Officer</option>
          <option value='Student Government'>Student Government</option>
        </select>
        {data.adminType === 'Organization Officer' && (
          <>
            <label>Position</label>
            <select
              value={data.position}
              onChange={(e) => setData({ ...data, position: e.target.value })}
              required
            >
              <option value=''>Select Position</option>
              <option value='President'>President</option>
              <option value='Vice President'>Vice President</option>
              <option value='Auditor'>Auditor</option>
              <option value='Treasurer'>Treasurer</option>
              <option value='Public Relations Officer'>Public Relations Officer</option>
              <option value='1st Year Representative'>1st Year Representative</option>
              <option value='2nd Year Representative'>2nd Year Representative</option>
              <option value='3rd Year Representative'>3rd Year Representative</option>
              <option value='4th Year Representative'>4th Year Representative</option>
            </select>
          </>
        )}
        {data.adminType === 'Student Government' && (
          <>
            <label>Position</label>
            <select
              value={data.position}
              onChange={(e) => setData({ ...data, position: e.target.value })}
              required
            >
              <option value=''>Select Position</option>
              <option value='President'>President</option>
              <option value='Secretary'>Secretary</option>
              <option value='Vice President'>Vice President</option>
              <option value='Auditor'>Auditor</option>
              <option value='Treasurer'>Treasurer</option>
              <option value='Public Relations Officer'>Public Relations Officer</option>
              <option value='SHS Representative'>SHS Representative</option>
            </select>
          </>
        )}
         <label>Organization</label>
        <select
          value={data.organization}
          onChange={(e) => setData({ ...data, organization: e.target.value })}
          required
        >
          <option value=''>Select Organization</option>
          {organizations.map((org) => (
            <option key={org._id} value={org.name}>
              {org.name}
            </option>
          ))}
        </select>
        <label>School Year</label>
        <input
          type='text'
          value={data.schoolYear}
          onChange={(e) => setData({ ...data, schoolYear: e.target.value })}
          required
          className = 'input_field'
        />
        <button type='submit'>Register</button>
      </form>
    </div>
  );
};

export default StudentRegistration;
