import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './RegisterModal.css'

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
      <h2 className='border-b-2 py-1 border-gray-800 text-lg font-semibold'>Student Registration</h2>
      <form onSubmit={handleSubmit}>

        <div className="flex flex-col text-left m-1">
        <label>Name</label>
        <input
          type='text'
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
          className='input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl'
        />
        </div>

        <div className="flex flex-col text-left m-1">
        <label>Email</label>
        <input
          type='email'
          value={data.studentemail}
          onChange={(e) => setData({ ...data, studentemail: e.target.value })}
          required
          className='input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl'
        />
        </div>

        <div className="flex flex-col text-left m-1">
        <label>Password</label>
        <input
          type='password'
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          required
          className='input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl'
        />
        </div>

        <div className="flex flex-col text-left m-1">
        <label>Admin Type</label>
        <select value={data.adminType} onChange={(e) => setData({ ...data, adminType: e.target.value })} className='select select-accent select-sm w-full max-w-full text-gray-700 bg-white shadow-2xl'>
          <option value='Organization Officer'>Organization Officer</option>
          <option value='Student Government'>Student Government</option>
        </select>

        </div>


        {data.adminType === 'Organization Officer' && (
          <>
          <div className="flex flex-col text-left m-1">
            <label>Position</label>
            <select
              value={data.position}
              onChange={(e) => setData({ ...data, position: e.target.value })}
              required
              className='select select-accent select-sm w-full max-w-full text-gray-700 bg-white shadow-2xl'
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
            </div>
          </>
        )}
        {data.adminType === 'Student Government' && (
          <>
          <div className="flex flex-col text-left m-1">
            <label>Position</label>
            <select
              value={data.position}
              onChange={(e) => setData({ ...data, position: e.target.value })}
              required
              className='select select-accent select-sm w-full max-w-full text-gray-700 bg-white shadow-2xl'
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
            </div>
          </>
        )}

        <div className="flex flex-col text-left m-1">
         <label>Organization</label>
        <select
          value={data.organization}
          onChange={(e) => setData({ ...data, organization: e.target.value })}
          required
          className='select select-accent select-sm w-full max-w-full text-gray-700 bg-white shadow-2xl'
        >
          <option value=''>Select Organization</option>
          {organizations.map((org) => (
            <option key={org._id} value={org.name}>
              {org.name}
            </option>
          ))}
        </select>
        </div>

        <div className="flex flex-col text-left m-1">
        <label>School Year</label>
        <input
          type='text'
          value={data.schoolYear}
          onChange={(e) => setData({ ...data, schoolYear: e.target.value })}
          required
          className='input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl'
        />
        </div>
        <button type='submit' className=' btn btn-wide btn-success btn-sm mt-2'>Register</button>
      </form>
    </div>
  );
};

export default StudentRegistration;
