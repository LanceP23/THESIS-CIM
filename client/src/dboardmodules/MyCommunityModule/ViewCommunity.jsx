import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../../context/userContext';
import RecentPostCommunity from './RecentPostCommunity'; 

const ViewCommunity = () => {
  // State variables
  const [adminCommunities, setAdminCommunities] = useState([]);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewCommunityId, setViewCommunityId] = useState(null); 

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  // Fetch community data when component loads
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const currentUserId = user.id;
        const token = getToken();
        const response = await axios.get('/view-community', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userCommunities = response.data.filter(community => {
          return community.members.some(member => member.userId === currentUserId && member.role === 'admin');
        });

        setAdminCommunities(userCommunities);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [user]);

  const handleViewCommunity = (communityId) => {
    // Toggle the viewCommunityId state
    setViewCommunityId(prevId => (prevId === communityId ? null : communityId));
  };

  return (
    <div>
      {/* Loading state */}
      {loading && <p>Loading...</p>}
      {/* Display admin communities */}
      {!loading && adminCommunities.length === 0 && <p>No communities found.</p>}
      {!loading && adminCommunities.length > 0 && (
        <div>
          <h2>Your Admin Communities</h2>
          <ul>
            {adminCommunities.map(community => (
              <li key={community._id}>
                {/* Render community details */}
                <p>{community.name}</p>
                {/* Add a button to view community details */}
                <button onClick={() => handleViewCommunity(community._id)}>View</button>
                {/* Conditionally render RecentPostCommunity based on viewCommunityId */}
                {viewCommunityId === community._id && <RecentPostCommunity communityId={community._id} />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ViewCommunity;
