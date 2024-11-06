import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserContext } from '../../../context/userContext';
import MyCommunityAnalytics from './MyCommuityAnalytics';
import ForumPost from './ForumPost';
import RecentPostCommunity from './RecentPostCommunity';
import { Link } from 'react-router-dom'; // Import Link for routing
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const ViewCommunity = () => {
  const [adminCommunities, setAdminCommunities] = useState([]);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewCommunityId, setViewCommunityId] = useState(null);
  const [activeView, setActiveView] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5); // Number of communities to show initially
  const [forumPosts, setForumPosts] = useState([]);

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const currentUserId = user.id;
        const token = getToken();
        const response = await axios.get('/view-community', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userCommunities = response.data.filter(community => 
          community.members.some(member => member.userId === currentUserId && member.role === 'admin')
        );
        setAdminCommunities(userCommunities);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchForumPosts = async () => {
      try {
        const response = await axios.get('/recent-forum-posts');
        setForumPosts(response.data); // Store the last 5 posts in the state
      } catch (error) {
        console.error('Error fetching forum posts:', error);
        toast.error('Failed to fetch forum posts');
      }
    };

    fetchCommunityData();
    fetchForumPosts(); // Fetch forum posts when the component loads
  }, [user]);

  const handleView = (communityId, viewType) => {
    setViewCommunityId(viewCommunityId === communityId && activeView === viewType ? null : communityId);
    setActiveView(activeView === viewType ? null : viewType);
  };

  const handleRemoveMember = async (communityId, memberId) => {
    const token = getToken();
    try {
      await axios.delete(`/community/${communityId}/member/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Member removed successfully');
      setAdminCommunities(prev => 
        prev.map(community => community._id === communityId 
          ? { ...community, members: community.members.filter(m => m.userId !== memberId) } 
          : community
        )
      );
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const confirmRemoveMember = (communityId, memberId) => {
    toast((t) => (
      <div>
        <p>Are you sure you want to remove this member?</p>
        <div className="flex gap-2">
          <button onClick={() => { handleRemoveMember(communityId, memberId); toast.dismiss(t.id); }} className="btn btn-success btn-sm">Yes</button>
          <button onClick={() => toast.dismiss(t.id)} className="btn btn-danger btn-sm">No</button>
        </div>
      </div>
    ));
  };

  // Function to handle "Load More" button click
  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 5); // Load 5 more communities each time
  };

  const handleScroll = (e) => {
    const container = e.target;
    if (container.scrollTop > 0) {
      container.classList.add('scrollable'); // Add 'scrollable' class when scrolling
    } else {
      container.classList.remove('scrollable'); // Remove 'scrollable' class when at the top
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="p-6 mx-auto max-w-4xl w-full lg:w-3/4">
        <h2 className="text-4xl text-green-700 mb-4">Your Admin Communities</h2>
        {loading && <p>Loading...</p>}
        {!loading && adminCommunities.length === 0 && <p>No communities found.</p>}
        {!loading && adminCommunities.slice(0, visibleCount).map(community => (
          <div key={community._id} className="bg-white shadow-md rounded-lg mb-5 p-6">
            <div className="flex items-center mb-4">
              <img src={community.logo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="Community Logo" className="w-16 h-16 rounded-full mr-4" />
              <div>
                <h3 className="text-2xl font-semibold">{community.name}</h3>
                <p className="text-sm text-gray-600">United States</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleView(community._id, 'posts')} className="btn btn-primary w-full">View Posts</button>
              <button onClick={() => handleView(community._id, 'members')} className="btn btn-primary w-full">View Members</button>
              <button onClick={() => handleView(community._id, 'analytics')} className="btn btn-primary w-full">View Analytics</button>
              <button onClick={() => handleView(community._id, 'forum')} className="btn btn-primary w-full">Forum</button>
            </div>

            {viewCommunityId === community._id && activeView === 'members' && (
              <div className="mt-4">
                <h4 className="text-xl font-semibold mb-2">Members</h4>
                <ul>
                  {community.members.map(member => (
                    <li key={member.userId} className="flex items-center mb-2">
                      <img src={member.avatar || "https://img.daisyui.com/tailwind-css-component-profile-2@56w.png"} alt="Member Avatar" className="w-10 h-10 rounded-full mr-3" />
                      <span className="font-medium">{member.name}</span>
                      <button onClick={() => confirmRemoveMember(community._id, member.userId)} className="ml-auto btn btn-error btn-xs">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {viewCommunityId === community._id && activeView === 'posts' && (
              <div className="mt-4">
                <RecentPostCommunity communityId={community._id} />
              </div>
            )}

            {viewCommunityId === community._id && activeView === 'analytics' && (
              <div className="mt-4">
                <MyCommunityAnalytics communityId={community._id} />
              </div>
            )}
            
            {viewCommunityId === community._id && activeView === 'forum' && (
              <div className="mt-4">
                <ForumPost communityId={community._id} />
              </div>
            )}
          </div>
        ))}

        {visibleCount < adminCommunities.length && (
          <button onClick={handleLoadMore} className="btn btn-secondary w-full">
            Load More
          </button>
        )}
      </div>

    {/* Floating Forum Posts Display */}
<div
  className="fixed left-5 top-1/4 bg-white p-4 shadow-2xl rounded-2xl border border-gray-200 w-80 h-auto max-h-[70vh] overflow-y-auto hidden md:block transition-transform hover:scale-105 scrollbar-hide"
  onScroll={handleScroll}
>
  <h3 className="text-2xl font-bold text-gray-800 mb-6">Latest Forum Posts</h3>

  {forumPosts.length === 0 ? (
    <p className="text-center text-gray-400">No forum posts found.</p>
  ) : (
    forumPosts.map((post) => (
      <div
        key={post._id}
        className="mb-6 pb-4 border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors rounded-xl"
      >
        <div className="flex items-start space-x-4">
          {/* Profile Picture Placeholder */}
          <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"><img src= {post.logo}></img></div>

          {/* Post Content */}
          <div className="flex-1 space-y-2">
            {/* Community Name and Post Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-primary font-semibold">{post.communityName}</p>
              <h4 className="text-sm text-gray-500">• {new Date(post.datePosted).toLocaleDateString()}</h4>
            </div>
            <h4 className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
              {post.header}
            </h4>

            {/* Media Image */}
            {post.mediaURL && (
              <div className="rounded-lg overflow-hidden max-h-48">
                <img
                  src={post.mediaURL}
                  alt="Post Media"
                  className="w-full h-full object-cover transition-transform transform hover:scale-105"
                />
              </div>
            )}

            {/* Post Body */}
            <p className="text-sm text-gray-700 line-clamp-3">{post.body}</p>

            {/* Like/Dislike with Icons */}
            <div className="flex items-center justify-between text-gray-500 mt-4">
              <div className="flex items-center space-x-1">
                <FaThumbsUp className="text-blue-500 cursor-pointer hover:text-blue-600 transition-colors" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaThumbsDown className="text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
                <span>{post.dislikes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))
  )}
</div>



      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-10 space-y-4">
        {/* Link to the Create Post Page */}
        <Link to="/createannouncement">
          <button 
            className="btn btn-success text-white rounded-full p-2 shadow-lg transition-all transform hover:scale-110 hover:bg-green-600 focus:outline-none"
          >
            <span className="text-xl">+</span> Post
          </button>
        </Link>
        
        {/* Link to the Create Event Page */}
        <Link to="/event-calendar">
          <button 
            className="btn btn-primary text-white rounded-full p-2 shadow-lg transition-all transform hover:scale-110 hover:bg-blue-600 focus:outline-none"
          >
            <span className="text-xl">+</span> Event
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ViewCommunity;
