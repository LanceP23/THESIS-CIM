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
      const response = await axios.get('/organization');
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
      const response = await axios.get(`/organization/${orgName}/potential_members`, { headers: { Authorization: `Bearer ${token}` } });
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
          `/organization/${encodedOrgName}/add_members`,
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
      const response = await axios.get(`/organization/${orgName}/members`);
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
        `/organizations/${activeOrgId}/members/${memberId}`, // Update the API endpoint URL
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
        `/organizations/${activeOrgId}/members/${memberId}`,
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
      const response = await axios.post('/create_organization', newOrganization, { headers: { Authorization: `Bearer ${token}` } });
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
    <div className="animate-fade-in p-5 bg-gray-50 min-h-screen">

      {adminType !== 'Organization Officer' && (
        <div className="mt-8 rounded-2xl shadow-lg p-6 bg-white">

          <h2 className="text-4xl text-green-800 flex items-center gap-2 pb-3 border-b-2 border-yellow-500">
            <FontAwesomeIcon icon={faPeopleArrows} className="text-yellow-500" />
            Manage Organizations
          </h2>

          <div className="my-4 flex justify-end">
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-success btn-wide"
            >
              + Add Organization
            </button>
          </div>

          {organizations.length === 0 ? (
            <p className="text-gray-500">No organizations yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-[500px] overflow-auto">
              {organizations.map((org) => (
                <div key={org._id} className="card bg-green-100 shadow-lg p-4 rounded-lg">
                  <h3 className="text-2xl text-green-800">{org.name}</h3>
                  <p className="text-sm text-gray-600">
                    School Year: <span className="font-semibold">{org.schoolYear}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Semester: <span className="font-semibold">{org.semester}</span>
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleShowMembers(org)}
                      className="btn btn-success flex-grow"
                    >
                      Show Members
                    </button>
                    <button
                      onClick={() => fetchPotentialMembers(org.name, org._id)}
                      className="btn btn-outline btn-success flex-grow"
                    >
                      Potential Members
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Organization Modal */}
          <Modal
            isOpen={showModal}
            onRequestClose={() => setShowModal(false)}
            contentLabel="Create Organization Modal"
            className="modal-container"
          >
            <div className="p-5 bg-gradient-to-r from-white to-green-100 rounded-lg">
              <h2 className="text-xl font-bold mb-3">Create a School Organization</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label>Organization Name:</label>
                  <input
                    type="text"
                    name="organizationName"
                    value={newOrganization.organizationName}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label>School Year:</label>
                  <input
                    type="text"
                    name="schoolYear"
                    value={newOrganization.schoolYear}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label>Semester:</label>
                  <input
                    type="text"
                    name="semester"
                    value={newOrganization.semester}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full"
                  />
                </div>
                <button type="submit" className="btn btn-success w-full mt-4">
                  Create Organization
                </button>
              </form>
            </div>
          </Modal>

          {/* Potential Members Modal */}
          <Modal
            isOpen={showPotentialMembersModal}
            onRequestClose={handleClosePotentialMembersModal}
            contentLabel="Potential Members Modal"
            className="modal-container"
          >
            <div className="p-5 bg-white rounded-lg">
              <h2 className="text-xl font-bold mb-3">Potential Members</h2>
              <div className="space-y-3">
                {potentialMembers.map((member) => (
                  <div key={member._id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg shadow">
                    <div>
                      <p>{member.name}</p>
                      <p className="text-sm text-gray-500">{member.position}</p>
                    </div>
                    <button
                      onClick={() => addPotentialMember(member._id, selectedOrganization)}
                      className="btn btn-success"
                    >
                      Add to Organization
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleClosePotentialMembersModal}
                className="btn btn-error w-full mt-4"
              >
                Close
              </button>
            </div>
          </Modal>

          {/* Members Modal */}
          <Modal
            isOpen={showMembersModal}
            onRequestClose={handleCloseMembersModal}
            contentLabel="Members Modal"
            className="modal-container"
          >
            <div className="p-5 bg-white rounded-lg">
              <h2 className="text-xl font-bold mb-3">Members of {selectedOrganization}</h2>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member._id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg shadow">
                    <div>
                      <p>{member.name}</p>
                      <p className="text-sm text-gray-500">{member.studentemail}</p>
                      <p className="text-sm text-gray-500">{member.position}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditMember(member)} className="btn btn-success btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteMember(member._id)} className="btn btn-error btn-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleCloseMembersModal} className="btn btn-error w-full mt-4">
                Close
              </button>
            </div>
          </Modal>
        </div>
      )}

      {adminType === 'Organization Officer' && <OrganizationOfficerPanel />}
    </div>
  );

};
