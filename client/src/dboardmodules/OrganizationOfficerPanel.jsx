import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../context/userContext';
import { useContext } from 'react';

export default function OrganizationOfficerPanel() {
  const { user } = useContext(UserContext);
  const [organizationData, setOrganizationData] = useState(null);
  const [members, setMembers] = useState([]);
  const [showPotentialMembersModal, setShowPotentialMembersModal] = useState(false);
  const [potentialMembers, setPotentialMembers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]); 
  const modalRef = useRef();

  const userWithId = { ...user, id: user?.id || '' };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const token = getCookie('token');
        const userId = user?.id;
  
        if (!token || !userId) {
          console.error('Token or User ID is not defined');
          return;
        }
  
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
        const response = await axios.get(`/organization-data/${userId}`, config);
        setOrganizationData(response.data);
        if (response.data.organization) {
          fetchMembers(response.data.organization);
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
        toast.error('Failed to fetch organization data');
      }
    };
  
    fetchOrgData();
  }, []);



  const fetchMembers = async (organization) => {
    try {
      const token = getCookie('token');
      const response = await axios.get(`/organization/${organization}/members`, { headers: { Authorization: `Bearer ${token}` } });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
    }
  };

  const fetchPotentialMembers = async (organization) => {
    try {
      const token = getCookie('token');
      const response = await axios.get(`/organization/${organization}/potential_members`, { headers: { Authorization: `Bearer ${token}` } });
      setPotentialMembers(response.data);
      setShowPotentialMembersModal(true);
    } catch (error) {
      console.error('Error fetching potential members:', error);
      toast.error('Failed to fetch potential members');
    }
  };

  const addPotentialMember = async (potentialMemberId) => {
    try {
      const token = getCookie('token');
      if (!organizationData.organization) {
        console.error('Organization name is null');
        return;
      }
      const encodedOrgName = encodeURIComponent(organizationData.organization);
      const response = await axios.post(
        `http://localhost:8000/organization/${encodedOrgName}/add_members`,
        { potentialMemberIds: [potentialMemberId] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.status === 200) {
        toast.success('Potential member added to organization');

        // Update the members state to include the new member
        const newMember = potentialMembers.find(member => member._id === potentialMemberId);
        setMembers(prevMembers => ({
          ...prevMembers,
          addedMembers: [...prevMembers.addedMembers, newMember]
        }));

        // Remove the added member from potential members list
        setPotentialMembers(prevPotentialMembers => 
          prevPotentialMembers.filter(member => member._id !== potentialMemberId)
        );

        setShowPotentialMembersModal(false);
      } else {
        toast.error('Failed to add potential member to organization');
      }
    } catch (error) {
      console.error('Error adding potential member to organization:', error);
      toast.error('Failed to add potential member to organization');
    }
  };

  const updateMember = async (memberId, updatedData) => {
    try {
      const token = getCookie('token');
      const response = await axios.put(
        `http://localhost:8000/organizations/${organizationData.organization}/members/${memberId}`, // Update the API endpoint URL
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowPotentialMembersModal(false);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);


  return (
    <div className="Manage_org_container my-14">
      <h2>{organizationData && organizationData.organization}</h2>
      <div className="org_table_container">
        <table className="organization-table">
          <thead>
            <tr colSpan="4" className='centered-header'>
              <th>Members</th>
            </tr>
            <tr className='table_header'>
              <th>Name</th>
              <th>Email</th>
              <th>Position</th>
              <th>School Year</th>
            </tr>
          </thead>
          <tbody>
            {members && members.addedMembers && members.addedMembers.map((member, index) => (
              <tr key={index}>
                <td>{member.name}</td>
                <td>{member.studentemail}</td>
                <td>{member.position}</td>
                <td>{member.schoolYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => fetchPotentialMembers(organizationData.organization)}>Show Potential Members</button>
      {showPotentialMembersModal && (
        <div ref={modalRef} className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg relative">
            <button className="absolute top-2 right-2" onClick={() => setShowPotentialMembersModal(false)}>Close</button>
            <h2 className="text-xl font-bold mb-4">Potential Members</h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Position</th> 
                  <th>School Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {potentialMembers.length > 0 ? (
                  potentialMembers.map((member, index) => (
                    <tr key={index}>
                      <td>{member.name}</td>
                      <td>{member.studentemail}</td>
                      <td>{member.position}</td>
                      <td>{member.schoolYear}</td>
                      <td>
                        <button 
                          onClick={() => {
                            addPotentialMember(member._id);
                          }} 
                          className="bg-blue-500 text-white px-2 py-1 rounded">
                          Add
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No potential members</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
