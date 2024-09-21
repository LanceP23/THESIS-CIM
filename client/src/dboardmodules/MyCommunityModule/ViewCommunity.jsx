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
  const [viewMembersCommunityId, setViewMembersCommunityId] = useState(null);

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
    setViewCommunityId(prevId => (prevId === communityId ? null : communityId));
  };

  const handleViewMembers = (communityId) => {
    setViewMembersCommunityId(prevId => (prevId === communityId ? null : communityId));
  };

  return (
    <div className='mt-16 p-3'>
      <div className="bg-slate-200 rounded-xl p-3">
        {loading && <p>Loading...</p>}
        {!loading && adminCommunities.length === 0 && <p>No communities found.</p>}
        {!loading && adminCommunities.length > 0 && (
          <div>
            <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2 my-2'>Your Admin Communities</h2>
            <div className='flex flex-row justify-between'>
              <div className="max-w-full max-h-96 overflow-auto">
                <table className="max-w-full">
                  <thead className='sticky top-0 z-10'>
                    <tr>
                      <th className='bg-green-500 text-white'>Community Name</th>
                      <th className='bg-green-500 text-white'>View Posts</th>
                      <th className='bg-green-500 text-white'>View Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminCommunities.map(community => (
                      <tr key={community._id} className='hover:bg-yellow-200'>
                        <td className='border-b-2 border-black'>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                <img src={community.logo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="Avatar" />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{community.name}</div>
                              <div className="text-sm opacity-50">United States</div>
                            </div>
                          </div>
                        </td>
                        <td className='border-b-2 border-black'>
                          <button onClick={() => handleViewCommunity(community._id)} className='btn btn-success btn-sm'>Posts</button>
                        </td>
                        <td className='border-b-2 border-black'>
                          <button onClick={() => handleViewMembers(community._id)} className='btn btn-success btn-sm'>Members</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divider lg:divider-horizontal divider-warning"></div>
              <div className="w-3/4 max-w-full mx-auto p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-semibold mb-4 border-b-2 text-green-700 border-yellow-300">Recent Posts for Community</h2>
                {adminCommunities.map(community => (
                  <div key={community._id}>
                    {viewCommunityId === community._id && <RecentPostCommunity communityId={community._id} />}
                  </div>
                ))}
                {adminCommunities.map(community => (
                  <div key={community._id}>
                    {viewMembersCommunityId === community._id && (
                      <div>
                        <h2 className="text-lg font-semibold mb-4 border-b-2 text-green-700 border-yellow-300">Members</h2>
                        <ul>
                          {community.members.map(member => (
                            <li key={member.userId} className="mb-2">
                              <div className="flex items-center gap-3">
                                <div className="avatar">
                                  <div className="mask mask-squircle w-8 h-8">
                                    <img src={member.avatar || "https://img.daisyui.com/tailwind-css-component-profile-2@56w.png"} alt="Member Avatar" />
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold">{member.name}</div>
                                  <div className="text-sm opacity-50">{member.role}</div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCommunity;
