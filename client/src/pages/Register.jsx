import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: '',
    studentemail: '',
    password: '',
    adminType: 'School Owner', 
  });

  const registerAdmin = async (e) => {
    e.preventDefault();

    const { name, studentemail, password, adminType } = data;

    try {
      const { data } = await axios.post('/register', {
        name,
        studentemail,
        password,
        adminType,
      });
      if (data.error) {
        toast.error(data.error);
      } else {
        setData({
          name: '',
          studentemail: '',
          password: '',
          adminType: '', 
        });
        toast.success('Registration Successful!');
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdminTypeChange = (e) => {
    setData({ ...data, adminType: e.target.value });
  };

  return (
    <div className='register-form'>
      <Navbar/>
      <form onSubmit={registerAdmin}>
        <label>Name</label>
        <input
          type='text'
          placeholder='Enter Full Name...'
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <label>Admin Email</label>
        <input
          type='text'
          placeholder='Enter Admin Email...'
          value={data.studentemail}
          onChange={(e) => setData({ ...data, studentemail: e.target.value })}
        />
        <label>Password</label>
        <input
          type='password'
          placeholder='Enter Your Password'
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
        <label>Admin Type</label>
        <select value={data.adminType} onChange={handleAdminTypeChange}>
          <option value='School Owner'>School Owner</option>
          <option value='President'>President</option>
          <option value='School Executive Admin'>School Executive Admin</option>
          <option value='School Executive Dean'>School Executive Dean</option>
          <option value='Program Head'>Program Head</option>
          <option value='Student Government'>Student Government</option>
        </select>
        <button type='submit'>Register</button>
      </form>
    </div>
  );
}
