import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function ShowMembers() {
  const [members, setMembers] = useState([]);
  const { orgId } = useParams();

  useEffect(() => {
    fetchMembers(orgId);
  }, [orgId]);

  const fetchMembers = async (orgId) => {
    try {
      const response = await axios.get(`http://localhost:8000/organization/${orgId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  return (
    <div>
      <h2>Members of Organization</h2>
      <ul>
        {members.map((member) => (
          <li key={member._id}>
            {member.name} - {member.position}
          </li>
        ))}
      </ul>
    </div>
  );
}
