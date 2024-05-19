import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './RegisterModal.css'

const StaffRegistration = ({ data, setData }) => {
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
          adminType: 'School Owner',
          organization: '',
          position: '',
          schoolYear: '', 
        });
        toast.success('Staff registration successful!');
      }
    } catch (error) {
      console.error('Error registering staff:', error);
      toast.error('Failed to register staff');
    }
  };

  const handleAdminTypeChange = (e) => {
    setData({ ...data, adminType: e.target.value });
  };

  return (
    <div>
      <h2 className='border-b-2 py-1 border-gray-800 text-lg font-semibold'>Staff Registration</h2>
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
        <select value={data.adminType} onChange={handleAdminTypeChange} className='select select-accent select-sm w-full max-w-full text-gray-700 bg-white shadow-2xl'>
          <option value='School Owner'>School Owner</option>
          <option value='President'>President</option>
          <option value='School Executive Admin'>School Executive Admin</option>
          <option value='School Executive Dean'>School Executive Dean</option>
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
        <button type='submit' className='btn btn-success btn-wide btn-sm my-2'>Register</button>
      </form>
    </div>
  );
};

export default StaffRegistration;
