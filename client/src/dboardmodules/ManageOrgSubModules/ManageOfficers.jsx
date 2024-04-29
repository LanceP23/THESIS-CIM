import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ManageOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/officers/pending');
      setOfficers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast.error('Failed to fetch officers');
      setLoading(false);
    }
  };

  const handleApproveOfficer = async (officerId) => {
    try {
      await axios.put(`http://localhost:8000/approve_officer/${officerId}`);
      setOfficers(officers.filter(officer => officer._id !== officerId));
      toast.success('Officer approved successfully');
    } catch (error) {
      console.error('Error approving officer:', error);
      toast.error('Failed to approve officer');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Manage Officers to be Approved</h2>
      <ul>
        {officers.map((officer) => (
          <li key={officer._id}>
            {officer.name} - {officer.position} - {officer.status}
            <div>
              <button onClick={() => handleApproveOfficer(officer._id)} className='approve_button'>Approve</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
