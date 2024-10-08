import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
<<<<<<< Updated upstream
=======
import StaffRegistration from '../RegistrationModals/StaffRegistration'; 
import FacultyRegistration from '../RegistrationModals/FacultyRegistration';
import StudentRegistration from '../RegistrationModals/StudentRegistration';
<<<<<<< Updated upstream
import Sidebar from '../components/Sidebar'; // Import Sidebar component
import './Register.css'
>>>>>>> Stashed changes

=======
import Sidebar from '../components/Sidebar'; 
import RegisteredAccounts from '../RegisteredAdmins/RegisteredAccounts';
import './Register.css'
>>>>>>> Stashed changes
export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: '',
    studentemail: '',
    password: '',
    adminType: 'School Owner',
    organization: '', // New field for organization name
    position: '', // New field for position in the organization
  });
  const [organizations, setOrganizations] = useState([]);

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

  const registerAdmin = async (e) => {
    e.preventDefault();

    const { name, studentemail, password, adminType, organization, position } = data;

    try {
      const { data } = await axios.post('/register', {
        name,
        studentemail,
        password,
        adminType,
        organization,
        position,
      });
      if (data.error) {
        toast.error(data.error);
      } else {
        setData({
          name: '',
          studentemail: '',
          password: '',
          adminType: 'School Owner',
          organization: '',
          position: '',
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <div className='register-form'>
      <Navbar />
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
          <option value='Organization Officer'>Organization Officer</option>
        </select>
        {data.adminType === 'Organization Officer' && (
          <>
            <label>Organization Name</label>
            <select
              value={data.organization}
              onChange={(e) => setData({ ...data, organization: e.target.value })}
            >
              <option value=''>Select Organization</option>
              {organizations.map((org) => (
                <option key={org._id} value={org.name}>
                  {org.name}
                </option>
              ))}
            </select>
            <label>Position</label>
            <select
              value={data.position}
              onChange={(e) => setData({ ...data, position: e.target.value })}
            >
              <option value=''>Select Position</option>
              <option value='President'>President</option>
              <option value='Vice President'>Vice President</option>
              <option value='Secretary'>Secretary</option>
              <option value='Treasurer'>Treasurer</option>
              <option value='Public Relations Officer'>Public Relations Officer</option>
              <option value='Auditor'>Auditor</option>
              <option value='1st Year Representative'>1st Year Representative</option>
              <option value='2nd Year Representative'>2nd Year Representative</option>
              <option value='3rd Year Representative'>3rd Year Representative</option>
              <option value='4th Year Representative'>4th Year Representative</option>
              <option value='Member'>Member</option>
            </select>
          </>
        )}
        <button type='submit'>Register</button>
      </form>
=======
    <div>
      <Sidebar adminType={data.adminType} /> {/* Pass adminType as prop */}
=======
    <div className=" mt-7 p-3">
      <div className="flex justify-between">
    <div className='  bg-slate-100 mt-5 rounded-lg shadow-inner p-2'>
>>>>>>> Stashed changes

      <div className="button_container">
      <button onClick={() => handleRegistrationType('staff')} className = 'register_button'>Staff Registration</button>
        <button onClick={() => handleRegistrationType('faculty')} className = 'register_button'>Faculty Registration</button>
        <button onClick={() => handleRegistrationType('student')} className = 'register_button'>Student Registration</button>
      </div>
=======
    <div className='Account_registration_container'>
      <Sidebar adminType={data.adminType} /> 
      

       <div className="register_form_container">

       <div className="button_container">
        <button onClick={() => handleRegistrationType('staff')} className = 'register_button'>Staff Registration</button>
        <button onClick={() => handleRegistrationType('faculty')} className = 'register_button'>Faculty Registration</button>
        <button onClick={() => handleRegistrationType('student')} className = 'register_button'>Student Registration</button>
       </div>
>>>>>>> Stashed changes
      <div className='register-form'>

     

        {registrationType === 'staff' && (
          <StaffRegistration
            data={data}
            setData={setData}
            organizations={organizations}
            registerAdmin={registerAdmin}
            handleAdminTypeChange={handleAdminTypeChange}
          />
        )}
        {registrationType === 'faculty' && (
          <FacultyRegistration
            data={data}
            setData={setData}
          />
        )}
        {registrationType === 'student' && (
          <StudentRegistration
            data={data}
            setData={setData}
            organizations={organizations}
            registerAdmin={registerAdmin}
          />
        )}

        
<<<<<<< Updated upstream
       
      </div>
<<<<<<< Updated upstream

      
>>>>>>> Stashed changes
=======
=======
      <div className="divider divider-warning"></div>

      

    
      </div>
      <div className="mx-3 ">
    <div className=' bg-gradient-to-r from-white to-green-200 p-4 my-5 rounded-lg shadow-2xl '>
>>>>>>> Stashed changes
        
      </div>
    </div>

    

      <div className=" bg-slate-100  rounded-lg shadow-inner ">
      <div className=" w-full">
        
        <RegisteredAccounts />
        </div>
      

      </div>

      </div>

      <div className="registered_accounts_container">
        <div className="registered_accounts">
        <RegisteredAccounts />
        </div>
      </div>
>>>>>>> Stashed changes
    </div>
  );
}
