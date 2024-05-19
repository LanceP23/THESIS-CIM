import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import './OrganizationReg.css';
import Modal from 'react-modal'; 
import { UserContext } from '../../context/userContext';
import { useContext } from 'react';
import OrganizationOfficerPanel from './OrganizationOfficerPanel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleArrows } from '@fortawesome/free-solid-svg-icons';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000, 
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    maxWidth: '70%',
    padding: '20px',
    textAlign: 'center',
    zIndex: 1001, 
    maxHeight: '100vh', // Maximum height for modal content
    backgroundImage: 'linear-gradient(to right,white ,#98D08F)', // Add gradient background
    borderRadius: '30px', // Add border radius property
    
    
    
    
  },
};

export default function OrganizationReg() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [organizations, setOrganizations] = useState([]);
  const [potentialMembers, setPotentialMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newOrganization, setNewOrganization] = useState({
    organizationName: '',
    schoolYear: '',
    semester: ''
  });
  const [adminType, setAdminType] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showPotentialMembersModal, setShowPotentialMembersModal] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState(null); 
  const [organizationData, setOrganizationData] = useState(null);
  const [members, setMembers] = useState([]); 
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editSchoolYear, setEditSchoolYear] = useState('');
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/check-auth');
        if (!response.data.authenticated) {
          // If not authenticated, redirect to login
          navigate('/login');
        } else {
          // Set the admin type
          setAdminType(localStorage.getItem('adminType'));
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  // Fetch admin type from localStorage
  const adminType2 = localStorage.getItem('adminType');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (activeOrgId) {
      fetchMembers(selectedOrganization);
    }
  }, [activeOrgId, selectedOrganization]);
  
  const fetchOrganizations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/organization');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
    }
  };

  const fetchPotentialMembers = async (orgName, orgId) => {
    try {
      setSelectedOrganization(orgName); 
      const token = getCookie('token');
      const response = await axios.get(`http://localhost:8000/organization/${orgName}/potential_members`, { headers: { Authorization: `Bearer ${token}` } });
      setPotentialMembers(response.data);
      setShowPotentialMembersModal(true);
    } catch (error) {
      console.error('Error fetching potential members:', error);
      toast.error('Failed to fetch potential members');
    }
  };

  const addPotentialMember = async (potentialMemberId, orgName) => {
    try {
      const token = getCookie('token');
      if (!orgName) {
        console.error('Organization name is null');
        return;
      }
      const encodedOrgName = encodeURIComponent(orgName);
      const response = await axios.post(
          `http://localhost:8000/organization/${encodedOrgName}/add_members`,
          { potentialMemberIds: [potentialMemberId] },
          { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.status === 200) {
        toast.success('Potential member added to organization');
        setShowPotentialMembersModal(false);
      } else {
        toast.error('Failed to add potential member to organization');
      }
    } catch (error) {
      console.error('Error adding potential member to organization:', error);
      toast.error('Failed to add potential member to organization');
    }
  };
  
  const fetchMembers = async (orgName) => {
    try {
      const response = await axios.get(`http://localhost:8000/organization/${orgName}/members`);
      const addedMembers = response.data.addedMembers;
      setMembers(addedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
    }
  };

  const handleShowMembers = (org) => {
    setActiveOrgId(org._id);
    setSelectedOrganization(org.name);
    setShowMembersModal(true);
  };
  
  const updateMember = async (memberId, updatedData) => {
    try {
      const token = getCookie('token');
      if (!activeOrgId) {
        console.error('activeOrgId is not defined');
        return;
      }
  
      // Ensure that schoolYear field is included in updatedData and is not empty
      if (!updatedData.schoolYear) {
        console.error('schoolYear is required');
        return;
      }
  
      const response = await axios.put(
        `http://localhost:8000/organizations/${activeOrgId}/members/${memberId}`, // Update the API endpoint URL
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        toast.success('Member updated successfully');
  
        // Update the members state with the updated member data
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member._id === memberId ? { ...member, ...updatedData } : member
          )
        );
      } else {
        toast.error('Failed to update member');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    }
  };
  
  // Function to delete a member
  const deleteMember = async (memberId) => {
    try {
      const token = getCookie('token');
      const response = await axios.delete(
        `http://localhost:8000/organizations/${activeOrgId}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        toast.success('Member deleted successfully');
        // Optionally, update the local state to remove the deleted member
      } else {
        toast.error('Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    }
  };

  const handleEditMember = (member) => {
    setEditMember(member);
    setEditName(member.name);
    setEditEmail(member.studentemail);
    setEditPosition(member.position);
    setEditSchoolYear(member.schoolYear);
  };

  const handleSaveMember = () => {
    if (editMember) {
      const updatedMember = {
        ...editMember,
        name: editName,
        studentemail: editEmail,
        position: editPosition,
        schoolYear: editSchoolYear
      };
      updateMember(editMember._id, updatedMember);
      setEditMember(null);
    }
  };

  const handleDeleteMember = (memberId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      deleteMember(memberId);
    }
  };
  
  const handleCloseMembersModal = () => {
    setShowMembersModal(false);
  };

  const handleClosePotentialMembersModal = () => {
    setShowPotentialMembersModal(false);
    setPotentialMembers([]);
  };

  const handleInputChange = (e) => {
    setNewOrganization({
      ...newOrganization,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Retrieve token from cookie
      const token = getCookie('token');
      const response = await axios.post('http://localhost:8000/create_organization', newOrganization, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 200) {
        toast.success('Organization created successfully');
        setNewOrganization({
          organizationName: '',
          schoolYear: '',
          semester: ''
        });
        setShowModal(false);
        fetchOrganizations(); // Refresh the list of organizations
      } else {
        toast.error('Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    }
  };

  // Function to get cookie value by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleManageOfficers = (orgId) => {
    navigate(`/organization/${orgId}/officers`);
  };

  return (
    <div className=' animate-fade-in'>


      {adminType !== 'Organization Officer'&&(
      <div className=" bg-slate-100 p-3 my-5 rounded-3xl shadow-inner shadow-slate-950">

        <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faPeopleArrows} className=' text-yellow-500 mx-1'/>Manage Organizations</h2>
        
        <div className="flex flex-col">
          <div className=" flex justify-end items-end">
        <div className="indicator my-3 ">
          <span className="indicator-item indicator-start badge badge-warning text-lg">+</span>
          <button onClick={() => setShowModal(true)} className=' btn btn-wide btn-success '>Add Organization</button>
          
        </div>
        </div>
        
      
        {organizations.length === 0 && <p>No organizations yet.</p>}

        {organizations.length > 0 && (
          <div className=" max-h-96 overflow-auto rounded-lg ">
            <table className=" ">
              <thead className=' sticky top-0'>
                <tr className=' text-left'>
                  <th className=' bg-green-700 text-white'>Organization Name</th>
                  <th className=' bg-green-700 text-white'>School Year</th>
                  <th className=' bg-green-700 text-white '>Semester</th>
                  <th className=' bg-green-700 text-white'>Members</th>
                  <th className=' bg-green-700 text-white'>Potential Members</th>
                  
                </tr>
              </thead>
              <tbody className="bg-green-100 border">
                  {organizations.map((org, index) => (
                    <tr
                      key={org._id}
                      className={` hover:bg-customyellow ${index % 2 === 0 ? 'bg-gray-200' : 'bg-green-100'}`}
                    >
                      <td className=" border-r-2 ">{org.name}</td>
                      <td className="border-r-2">{org.schoolYear}</td>
                      <td className="border-r-2 ">{org.semester}</td>
                      <td className="border-r-2   items-center">
                        <button onClick={() => handleShowMembers(org)} className="btn btn-success">
                          Show Members
                        </button>
                      </td>
                      <td className=" items-center">
                        <button onClick={() => fetchPotentialMembers(org.name, org._id)} className="btn btn-success">
                          View Potential Members
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>

            </table>
          </div>
        )}
        </div>

     

        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          contentLabel="Create Organization Modal"
          style={customStyles}
          
        >
          <div className=" bg-gradient-to-r from-white to-customgreen_1 p-3 rounded-lg " >
           
            <p></p>
            <h2 className=' my-2 text-xl font-bold border-b-2 border-black'>Create a School Organization</h2>
            <form onSubmit={handleSubmit} className='Org_form'>
              <div className="text-left ">
                <label htmlFor="organizationName">Organization Name:</label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={newOrganization.organizationName}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered input-success input-md w-full  bg-white text-black rounded-md shadow-xl"
                />
              </div>
              <div className="text-left my-1">
                <label htmlFor="schoolYear">School Year:</label>
                <input
                  type="text"
                  id="schoolYear"
                  name="schoolYear"
                  value={newOrganization.schoolYear}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered input-success input-md w-full  text-black  bg-white rounded-md shadow-xl"
                />
              </div>
              <div className="text-left">
                <label htmlFor="semester">Semester:</label>
                <input
                  type="text"
                  id="semester"
                  name="semester"
                  value={newOrganization.semester}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered input-success input-md w-full  text-black  bg-white rounded-md shadow-xl"
                />
              </div>
              <div className="dv">
              <button type="submit" className='btn btn-wide btn-success float-end my-3'>Create Organization</button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal
          isOpen={showPotentialMembersModal}
          onRequestClose={handleClosePotentialMembersModal}
          contentLabel="Potential Members Modal"
          style={customStyles}
        >
          <div className="">
            <h2 className='text-xl border-b-2'>Potential Members</h2>
            <div className=" bg-slate-50 ">

              
            <table>
            <thead>
                  <tr >
                    <th className=' bg-green-700 text-white text-left'> Member Name</th>
                    <th className=' bg-green-700 text-white text-left'>Position</th>
                    <th className=' bg-green-700 text-white text-left'>fsfdds</th>
                  </tr>

                </thead>
                <tbody>
              {potentialMembers.map((member, index) => (
                
                <tr key={member._id} className={` hover:bg-customyellow ${index % 2 === 0 ? 'bg-gray-200' : 'bg-green-100'}`}>
                 <td>{member.name} </td> 
                  <td>{member.position}</td>
                  <td><button onClick={() => addPotentialMember(member._id, selectedOrganization)} className='btn btn-success'>Add to Organization</button></td>
                </tr>
                
              ))}
             </tbody>
            </table>
            </div>

            <div className=" flex justify-end item">
              <button onClick={handleClosePotentialMembersModal} className='my-2 btn btn-wide btn-error float-end'>Close</button>
            </div>
         </div>
        </Modal>

        <Modal
        isOpen={showMembersModal}
        onRequestClose={handleCloseMembersModal}
        contentLabel="Members Modal"
       style={customStyles}
      >
        <div className=" ">
          <h2 className='text-xl border-b-2 py-2 border-gray-700'>Members of {selectedOrganization}</h2>
          <table>
            <thead>
              <tr>
                <th className=' bg-green-700 text-white text-left'>Name</th>
                <th className=' bg-green-700 text-white text-left'>Email</th>
                <th className=' bg-green-700 text-white text-left'>Position</th>
                <th className=' bg-green-700 text-white text-left'>School Year</th>
                <th className=' bg-green-700 text-white text-left'>Edit</th>
                <th className=' bg-green-700 text-white text-left'>Delete</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={member._id} className={` hover:bg-customyellow ${index % 2 === 0 ? 'bg-gray-200' : 'bg-green-100'}`}>
                  <td>
                    {editMember === member ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className='input input-bordered input-success input-sm w-full text-white bg-base rounded-md shadow-xl'
                      />
                    ) : (
                      member.name
                    )}
                  </td>
                  <td>
                    {editMember === member ? (
                      <input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className='input input-bordered input-success input-sm w-full text-white bg-base rounded-md shadow-xl'
                      />
                    ) : (
                      member.studentemail
                    )}
                  </td>
                  <td>
                    {editMember === member ? (
                      <input
                        value={editPosition}
                        onChange={(e) => setEditPosition(e.target.value)}
                        className='input input-bordered input-success input-sm w-full text-white bg-base rounded-md shadow-xl'
                      />
                    ) : (
                      member.position
                    )}
                  </td>
                  <td>
                    {editMember === member ? (
                      <input
                        value={editSchoolYear}
                        onChange={(e) => setEditSchoolYear(e.target.value)}
                        className='input input-bordered input-success input-sm w-full text-white bg-base rounded-md shadow-xl'
                      />
                    ) : (
                      member.schoolYear
                    )}
                  </td>
                  <td>
                    {editMember === member ? (
                      <button onClick={handleSaveMember} className='btn btn-sm btn-success'>Save</button>
                    ) : (
                      <button onClick={() => handleEditMember(member)} className='btn btn-xs btn-success'>Edit</button>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteMember(member._id)} className='btn btn-xs btn-error'>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="">
          <button onClick={handleCloseMembersModal} className=' my-3 btn btn-wide btn-error float-end'>Close</button>
          </div>
        </div>
      </Modal>
      </div>)}

      {adminType==='Organization Officer'&&(
        <OrganizationOfficerPanel/>
      )}

    </div>
  );
}
