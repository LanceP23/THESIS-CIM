import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import './OrganizationReg.css';
import ReactModal from 'react-modal'; 

export default function OrganizationReg() {
  const navigate = useNavigate();
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
          // If authenticated, set the admin type
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
    <div>
      <Sidebar adminType={adminType2} />

      <div className="Manage_org_container">
        <h2>Manage Organizations</h2>

        {organizations.length === 0 && <p>No organizations yet.</p>}

        {organizations.length > 0 && (
          <div className="org_table_container">
            <table className="organization-table">
              <thead>
                <tr className='table_header'>
                  <th>Organization Name</th>
                  <th>School Year</th>
                  <th>Semester</th>
                  <th>Members</th>
                  <th>Manage Officers</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org._id}>
                    <td>{org.name}</td>
                    <td>{org.schoolYear}</td>
                    <td>{org.semester}</td>
                    <td>
                      <button onClick={() => handleShowMembers(org)}>Show Members</button>
                    </td>
                    <td>
                      <button onClick={() => fetchPotentialMembers(org.name, org._id)}>View Potential Members</button>
                    </td>
                    <td>
                      <button onClick={() => handleManageOfficers(org._id)}>Manage Officers</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={() => setShowModal(true)} className='Add_button'>Add Organization</button>

        <ReactModal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          contentLabel="Create Organization Modal"
          className="Modal"
          overlayClassName="Overlay"
        >
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Create a School Organization</h2>
            <form onSubmit={handleSubmit} className='Org_form'>
              <div className="Org_name_field">
                <label htmlFor="organizationName">Organization Name:</label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={newOrganization.organizationName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="Org_name_field">
                <label htmlFor="schoolYear">School Year:</label>
                <input
                  type="text"
                  id="schoolYear"
                  name="schoolYear"
                  value={newOrganization.schoolYear}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="Org_name_field">
                <label htmlFor="semester">Semester:</label>
                <input
                  type="text"
                  id="semester"
                  name="semester"
                  value={newOrganization.semester}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className='create_org_button'>Create Organization</button>
            </form>
          </div>
        </ReactModal>

        <ReactModal
          isOpen={showPotentialMembersModal}
          onRequestClose={handleClosePotentialMembersModal}
          contentLabel="Potential Members Modal"
          className="Modal"
          overlayClassName="Overlay"
        >
          <div className="modal-content">
            <h2>Potential Members</h2>
            <ul>
              {potentialMembers.map((member) => (
                <li key={member._id}>
                  {member.name} - {member.position}
                  <button onClick={() => addPotentialMember(member._id, selectedOrganization)}>Add to Organization</button>
                </li>
              ))}
            </ul>
            <button onClick={handleClosePotentialMembersModal}>Close</button>
          </div>
        </ReactModal>

        <ReactModal
        isOpen={showMembersModal}
        onRequestClose={handleCloseMembersModal}
        contentLabel="Members Modal"
        className="Modal"
        overlayClassName="Overlay"
      >
        <div className="modal-content">
          <h2>Members of {selectedOrganization}</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>School Year</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td>
                    {editMember === member ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
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
                      />
                    ) : (
                      member.schoolYear
                    )}
                  </td>
                  <td>
                    {editMember === member ? (
                      <button onClick={handleSaveMember}>Save</button>
                    ) : (
                      <button onClick={() => handleEditMember(member)}>Edit</button>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteMember(member._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleCloseMembersModal}>Close</button>
        </div>
      </ReactModal>
      </div>
    </div>
  );
}
