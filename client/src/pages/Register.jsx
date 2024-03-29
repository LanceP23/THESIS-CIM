import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StaffRegistration from '../RegistrationModals/StaffRegistration'; 
import FacultyRegistration from '../RegistrationModals/FacultyRegistration';
import StudentRegistration from '../RegistrationModals/StudentRegistration';
import Sidebar from '../components/Sidebar'; // Import Sidebar component

export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: '',
    studentemail: '',
    password: '',
    adminType: 'School Owner', // Set adminType as 'School Owner'
    organization: '',
    position: '',
  });
  const [organizations, setOrganizations] = useState([]);
  const [registrationType, setRegistrationType] = useState(null); 

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

  const resetData = () => {
    setData({
      name: '',
      studentemail: '',
      password: '',
      adminType: 'School Owner',
      organization: '',
      position: '',
    });
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
        resetData(); // Clear fields after successful registration
        toast.success('Registration Successful!');
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdminTypeChange = (e) => {
    resetData(); // Clear fields when admin type changes
    setData({ ...data, adminType: e.target.value });
  };

  const handleRegistrationType = (type) => {
    resetData(); // Clear fields when registration type changes
    setRegistrationType(type);
  };

  return (
    <div>
      <Sidebar adminType={data.adminType} /> {/* Pass adminType as prop */}
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
        
        <button onClick={() => handleRegistrationType('staff')}>Staff Registration</button>
        <button onClick={() => handleRegistrationType('faculty')}>Faculty Registration</button>
        <button onClick={() => handleRegistrationType('student')}>Student Registration</button>
      </div>
    </div>
  );
}
