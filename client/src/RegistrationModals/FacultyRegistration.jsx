import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './RegisterModal.css'

const FacultyRegistration = ({ data, setData }) => {
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
          adminType: 'Program Head',
          department: '',
          schoolYear: '', 
        });
        toast.success('Faculty registration successful!');
      }
    } catch (error) {
      console.log(adminType);
      console.error('Error registering faculty:', error);
      toast.error('Failed to register faculty');
    }
  };

  return (
    <div>
      <h2 className='border-b-2 py-1 border-gray-800 text-lg font-semibold'>Faculty Registration</h2>
      <form onSubmit={handleSubmit}>

        <div className="flex flex-col text-left m-1">
        <label>Name</label>
        <input
          type='text'
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
          className='input input-bordered input-success input-sm w-full dark:text-white  rounded-md shadow-2xl'
        />
        </div>

        <div className="flex flex-col text-left m-1">
        <label>Email</label>
        <input
          type='email'
          value={data.studentemail}
          onChange={(e) => setData({ ...data, studentemail: e.target.value })}
          required
          className='input input-bordered input-success input-sm w-full dark:text-white  rounded-md shadow-2xl'
        />
        </div>

        <div className="flex flex-col text-left m-1">
        <label>Password</label>
        <input
          type='password'
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          required
          className='input input-bordered input-success input-sm w-full dark:text-white  rounded-md shadow-2xl'
        />
        </div>

        <div className="flex flex-col text-left m-1">
        <label>Admin Type</label>
        <select
          value={data.adminType}
          onChange={(e) => setData({ ...data, adminType: e.target.value })}
          className='select select-accent select-sm w-full max-w-full dark:text-white  shadow-2xl'
        >
          <option value='Program Head'>Program Head</option>
          <option value='Instructor'>Instructor</option>
        </select>
        </div>

        <div className="flex flex-col text-left m-1">
        <label>Department</label>
        <input
          type='text'
          value={data.department}
          onChange={(e) => setData({ ...data, department: e.target.value })}
          required
          className='input input-bordered input-success input-sm w-full dark:text-white rounded-md shadow-2xl'
        />
        </div>

        <div className="flex flex-col text-left m-1">
        <label>School Year</label>
        <input
          type='text'
          value={data.schoolYear}
          onChange={(e) => setData({ ...data, schoolYear: e.target.value })}
          required
          className='input input-bordered input-success input-sm w-full dark:text-white rounded-md shadow-2xl'
        />
        </div>
        <button type='submit' className='btn btn-success btn-wide btn-sm my-2'>Register</button>
      </form>
    </div>
  );
};

export default FacultyRegistration;
