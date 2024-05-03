import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StaffRegistration from '../RegistrationModals/StaffRegistration'; 
import FacultyRegistration from '../RegistrationModals/FacultyRegistration';
import StudentRegistration from '../RegistrationModals/StudentRegistration';
import StudentMobileUserReg from '../RegistrationModals/StudentMobileUser';
import Sidebar from '../components/Sidebar'; 
import RegisteredAccounts from '../RegisteredAdmins/RegisteredAccounts';
import './Register.css'
import UserManagement from '../mobileusermanagement/DisplayAllMobileAcc';
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
  const [academicYear, setAcademicYear] = useState('');
  const [schoolSemester, setSchoolSemester] = useState('');
  const [archivedAccounts, setArchivedAccounts] = useState([]);

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

  const updateSchoolSetting = async ()=>{
    try{
      const response = await axios.put('/route', {
        academicYear,
        schoolSemester,
      });
      if(response.data.success){
        toast.success('School setting updated succesfully!');
      } else{
        toast.error('Failed to update school setting');
      }
    } catch(error){
      console.error('Error updating school setting: ', error);
      toast.error('Failed to update school setting');
    }
  }

  const archiveAccounts = async () =>{
    try{
      const response =  await axios.post('/placeholdermuna');
      if(response.data.success){
        toast.success('Accounts archived successfully!');
      } else{
        toast.error('Failed to archive accounts');
      }
    }catch(error){
      console.error('Error archiving accounts: ', error);
      toast.error('Failed to archive accounts');
    }
  }

  return (
    <div className='Account_registration_container'>
      <Sidebar adminType={data.adminType} /> 

      <div>
        <h2>School Year Setting</h2>
        <div>
          <label htmlFor="academicYear">Academic Year:</label>
          <input
            type="text"
            id="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="Enter academic year"
          />
        </div>
        <div>
          <label htmlFor="schoolSemester">School Semester:</label>
          <input
            type="text"
            id="schoolSemester"
            value={schoolSemester}
            onChange={(e) => setSchoolSemester(e.target.value)}
            placeholder="Enter school semester"
          />
        </div>
        <div>
          <button onClick={updateSchoolSetting}>Update School Setting</button>
        </div>
      </div>
      

       <div className="register_form_container">

       <div className="button_container">
        <button onClick={() => handleRegistrationType('staff')} className = 'register_button'>Staff Registration</button>
        <button onClick={() => handleRegistrationType('faculty')} className = 'register_button'>Faculty Registration</button>
        <button onClick={() => handleRegistrationType('student')} className = 'register_button'>Student Registration</button>
       </div>
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
        
        
      </div>

      </div>

      <div className="registered_accounts_container">
        <div className="registered_accounts">
        <RegisteredAccounts />
        </div>
      </div>

      <StudentMobileUserReg/>

    </div>
  );
}
