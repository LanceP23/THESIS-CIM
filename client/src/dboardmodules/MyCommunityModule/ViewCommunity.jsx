import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserContext } from '../../../context/userContext';
import RecentPostCommunity from './RecentPostCommunity';
import MyCommunityAnalytics from './MyCommuityAnalytics'; // Import the analytics component


const navigate = useNavigate();
const ViewCommunity = () => {
  // State variables
  const [adminCommunities, setAdminCommunities] = useState([]);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewCommunityId, setViewCommunityId] = useState(null); // ID for the active view
  const [activeView, setActiveView] = useState(null); // Track the active view type ('posts', 'members', 'analytics')
 
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
  // Handle button click for viewing community posts, members, and analytics
  const handleView = (communityId, viewType) => {
    if (viewCommunityId === communityId && activeView === viewType) {
      // Close the currently active section if it's clicked again
      setViewCommunityId(null);
      setActiveView(null);
    } else {
      setViewCommunityId(communityId);
      setActiveView(viewType);
    }
  };

  const handleRemoveMember = async (communityId, memberId) => {
    const token = getToken();
    try {
      await axios.delete(`/community/${communityId}/member/${memberId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Member removed successfully');

      // Update state to reflect the member removal
      setAdminCommunities(prevCommunities =>
        prevCommunities.map(community => {
          if (community._id === communityId) {
            return {
              ...community,
              members: community.members.filter(member => member.userId !== memberId),
            };
          }
          return community;
        })
      );
    } catch (error) {
      toast.error('Failed to remove member');
      console.error(error);
    }
  };

  const confirmRemoveMember = (communityId, memberId) => {
    toast((t) => (
      <div>
        <p>Are you sure you want to remove this member?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              handleRemoveMember(communityId, memberId);
              toast.dismiss(t.id);
            }}
            className="btn btn-success btn-sm"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="btn btn-danger btn-sm"
          >
            No
          </button>
        </div>
      </div>
    ));

    
  };



  

  
  
  return (
    <div className='mt-16 p-3'>
      
      <div className="bg-slate-200 rounded-xl p-3">
        {loading && <p>Loading...</p>}
        {!loading && adminCommunities.length === 0 && <p>No communities found.</p>}
        {!loading && adminCommunities.length > 0 && (
          <div>
            <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2 my-2'>Your Admin Communities</h2>
            
            <div className='flex flex-col justify-between'>
              <div className="max-w-full max-h-96 overflow-auto">
                <table className="max-w-full">
                  <thead className='sticky top-0 z-10'>
                    <tr>
                      <th className='bg-green-500 text-white text-left'>Community Name</th>
                      <th className='bg-green-500 text-white text-left'>View Posts</th>
                      <th className='bg-green-500 text-white text-left'>View Members</th>
                      <th className='bg-green-500 text-white text-left'>Analytics</th> {/* New column for analytics */}
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
                          <button
                            onClick={() => handleView(community._id, 'posts')}
                            className='btn btn-success btn-sm'
                          >
                            Posts
                          </button>
                        </td>
                        <td className='border-b-2 border-black'>
                          <button
                            onClick={() => handleView(community._id, 'members')}
                            className='btn btn-success btn-sm'
                          >
                            Members
                          </button>
                        </td>
                        <td className='border-b-2 border-black'>
                          <button
                            onClick={() => handleView(community._id, 'analytics')}
                            className='btn btn-success btn-sm'
                          >
                            View Analytics
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divider lg:divider-horizontal divider-warning"></div>
              <div className="w-full mx-auto mt-5 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-semibold mb-4 border-b-2 text-green-700 border-yellow-300">
                  {activeView === 'posts' && "Recent Posts for Community"}
                  {activeView === 'members' && "Members of Community"}
                  {activeView === 'analytics' && "Community Analytics"}
                </h2>
                {adminCommunities.map(community => (
                  <div key={community._id}>
                   {viewCommunityId === community._id && activeView === 'members' && (
                      <div>
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
                                <button
                                 onClick={() => confirmRemoveMember(community._id, member.userId)}
                                  className="btn btn-error btn-sm ml-4"
                                >
                                  Remove
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {viewCommunityId === community._id && activeView === 'analytics' && (
                      <MyCommunityAnalytics communityId={community._id} />
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