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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faAddressCard } from '@fortawesome/free-solid-svg-icons';
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
      const response = await axios.get('/organization');
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
    <div className="mt-16">
    <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row xl:flex-row justify-between  ml-8 p-3">
      <div className="flex flex-col">
    <div className='  bg-slate-100  rounded-lg shadow-inner p-3 '>

    
      <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faAddressCard} className=' text-yellow-500 mx-1'/>Account Registration</h2>

      <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row xl:flex-row">
      <div className="bg-gradient-to-r from-white to-green-200 p-4 m-4 rounded-lg shadow-2xl">
      <StudentMobileUserReg/>
      </div>

     
      
      <div className="divider lg:divider-horizontal divider-warning my-3"></div> 

       <div className="register_form_container">

       <div className="flex flex-row my-2">
        <div className="div">
        <button onClick={() => handleRegistrationType('staff')} className = 'btn btn-success mx-1'>Staff Registration</button>
        </div>

        <div className="div">
        <button onClick={() => handleRegistrationType('faculty')} className = 'btn btn-success mx-1'>Faculty Registration</button>
        </div>

        <div className="div">
        <button onClick={() => handleRegistrationType('student')} className = 'btn btn-success mx-1'>Org. Officer Registration</button>
        </div>
       </div>

      <div className='bg-gradient-to-r from-white to-green-200 p-2 rounded-md shadow-2xl'>

     

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

      </div>
      
     

      
    </div>

    <div className="bg-slate-100 rounded-lg shadow-inner p-2 my-3">
        <RegisteredAccounts />
        </div>

        </div>

    <div className="mr-1 ml-2 ">
    <div className='flex flex-col bg-gradient-to-r from-white to-green-200 p-4  rounded-lg shadow-2xl '>
        
        <div className=' flex flex-col'>
          <label htmlFor="academicYear">Academic Year:</label>
          <input
            type="text"
            id="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="Enter academic year"
            className='input input-bordered input-success w-full dark:text-white'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor="schoolSemester">School Semester:</label>
          <input
            type="text"
            id="schoolSemester"
            value={schoolSemester}
            onChange={(e) => setSchoolSemester(e.target.value)}
            placeholder="Enter school semester"
            className='input input-bordered input-success w-full  dark:text-white'
          />
        </div>
        <div className='my-3'>
          <button onClick={updateSchoolSetting} className='btn btn-success'>Update School Setting</button>
        </div>
      </div>
      </div>

    </div>
    </div>
  );
}
