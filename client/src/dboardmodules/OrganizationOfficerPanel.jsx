import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../context/userContext';
import { useContext } from 'react';

export default function OrganizationOfficerPanel() {
  const { user } = useContext(UserContext);
  const [organizationData, setOrganizationData] = useState(null);
  const [members, setMembers] = useState([]);

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
      console.log('members: ', response.data)
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
    }
  };

  const handleShowMembers = (organization) => {
    fetchMembers(organization);
  };

  return (
    <div className="Manage_org_container">
      <h2>{organizationData && organizationData.organization}</h2>
      <div className="org_table_container">
        <table className="organization-table">
          <thead>
            <th colSpan="4" className='centered-header'>
                Members
            </th>
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
    </div>
  );
  
}