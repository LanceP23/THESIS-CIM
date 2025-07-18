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
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [selectedImage, setSelectedImage] = useState(''); // Selected image URL
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [mobileUsers, setMobileUsers] = useState([]);
  const [mobileUserFilter, setMobileUserFilter] = useState('');
  const [filterOption, setFilterOption] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);



  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage('');
  };


  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  const collegeSections = [
    'IT101', 'IT102', 'IT103', 'IT104', 'IT105', 'IT106',
    'BAMM101', 'BAMM102', 'TM101', 'TM102', 'TM103',
    'ALPHA', 'BRAVO', 'CHARLIE', 'BEED101', 'BSE-ENG101',
    'BSE-SOCSIE101', 'IT201', 'IT202', 'BAMM201', 'TM201',
    'ALPHA201', 'BRAVO202', 'BEED201', 'BSE-ENG201', 'IT301',
    'BAMM301', 'TM301', 'CRIM301', 'BEED301', 'BSE-ENG301',
    'IT401', 'BAMM401', 'TM401', 'CRIM401', 'IT501', 'IT701',
  ];

  // Function to fetch mobile users
  const fetchMobileUsers = async () => {
    try {
      const response = await axios.get('/get-mobile-users');
      setMobileUsers(response.data);
    } catch (error) {
      console.error('Error fetching mobile users:', error);
    }
  };
  useEffect(() => {
    if (showAddMembersModal) {
      fetchMobileUsers();
    }
  }, [showAddMembersModal]);
  

  const handleAddMember = async (userId, userType, communityId) => {
    if (!selectedMembers.includes(userId)) {
      try {
        // Call the API to add the member to the community
        const response = await axios.post(`/community/${communityId}/member`, {
          userId: userId,       // The user's ID
          userType: userType,   // The user type ("MobileUser")
          communityId: communityId // The community ID (the one where the user is being added)
        });
  
        // Update the local selectedMembers list if the API call succeeds
        setSelectedMembers([...selectedMembers, userId]);
        alert('Member added successfully!');
      } catch (error) {
        console.error('Error adding member:', error.response?.data || error.message);
        alert('Failed to add member. Please try again.');
      }
    } else {
      alert('User is already selected.');
    }
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

  const handleDelete = async (communityId) => { 
    if (window.confirm("Are you sure you want to delete this community?")) {
      try {
        // Directly make the API call here
        await axios.delete(`/delete/${communityId}`);
  
        // Update the state to remove the deleted community from the list
        setAdminCommunities(prev => prev.filter(community => community._id !== communityId));
  
        toast.success("Community deleted successfully");
      } catch (error) {
        toast.error("Failed to delete the community");
      }
    }
  };
  

  return (
    <div className=" pl-16 mt-16 mr-0 pt-7">

      <div className="bg-slate-200 rounded-xl w-full sm:w-full md:w-full lg:max-w-[72vw] xl:max-w-[72vw]  ">
      {/* Main Content */}

      <div className="p-6 sm:w-full md:w-full lg:max-w-[72vw] xl:max-w-[72vw] ">
        <h2 className="text-4xl text-green-800 mb-4 border-b border-yellow-500 ">Your Admin Communities</h2>
        {loading && <p>Loading...</p>}
        {!loading && adminCommunities.length === 0 && <p>No communities found.</p>}
        {!loading && adminCommunities.slice(0, visibleCount).map(community => (
          <div key={community._id} className="bg-white shadow-lg rounded-lg mb-5 p-6">

            <div className="flex flex-row justify-between">
            <div className="flex items-center mb-4">
              <img src={community.logo || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="Community Logo" className="w-16 h-16 rounded-full mr-4" />
              <div className=''>
                <h3 className="text-2xl font-semibold text-green-800  border-b border-yellow-500   ">{community.name}</h3>
                <p className="text-sm text-left text-gray-600">United States</p>

                

              </div>
            </div>
            <div className="div">
                <button 
                  onClick={() => handleDelete(community._id)} 
                  className="w-auto mt-2 py-1 px-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded"
                >
                  Delete
                </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleView(community._id, 'posts')} className="btn btn-info w-full">View Posts</button>
              <button onClick={() => handleView(community._id, 'members')} className="btn btn-info  w-full">View Members</button>
              <button onClick={() => handleView(community._id, 'analytics')} className="btn btn-info w-full">View Analytics</button>
              <button onClick={() => handleView(community._id, 'forum')} className="btn btn-info w-full">Forum</button>
              
             

            </div>
            
            {viewCommunityId === community._id && activeView === 'members' && (
        <div className="mt-4">
          <h4 className="text-xl font-semibold mb-2">Members</h4>

          <div className=" max-h-96 overflow-y-auto">
          <ul>
            {community.members.map((member) => (
              <li key={member.userId} className="flex items-center mb-2">
                <img
                  src={member.profilePicture|| 'https://img.daisyui.com/tailwind-css-component-profile-2@56w.png'}
                  alt="Member Avatar"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span className="font-medium text-black">{member.name}</span>
                <button
                  onClick={() => confirmRemoveMember(community._id, member.userId)}
                  className="ml-auto btn btn-error btn-xs"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          </div>
          <button
        onClick={() => {
          setShowAddMembersModal(true); 
          if (mobileUsers.length > 0) {
            handleAddMember(mobileUsers[0].userId, 'MobileUser', viewCommunityId); 
          }
        }}
        className="btn btn-success btn-sm mt-4"
      >
        Add Members
      </button>

        </div>
      )}

      {/* Add Members Modal */}
      {showAddMembersModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold dark:text-white">Add Members</h3>

            <div className="modal-action">
              <button onClick={() => setShowAddMembersModal(false)} className="btn btn-error btn-sm">
                Close
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              className="input input-bordered input-success input-md w-full mt-2 Text-gray-900 dark:text-white bg-base-100 rounded-md shadow-xl"
              value={mobileUserFilter}
              onChange={(e) => setMobileUserFilter(e.target.value)}
              placeholder="Filter by name or email"
            />

            {/* Filter by Education Level */}
            <div className="mt-4">
              <select
                value={filterOption}
                onChange={(e) => {
                  setFilterOption(e.target.value);
                  setSectionFilter(''); 
                }}
                className="select select-bordered select-md w-full Text-gray-900 dark:text-white"
              >
                <option value="All">All</option>
                <option value="Grade School">Grade School</option>
                <option value="High School">High School</option>
                <option value="Senior High School">Senior High School</option>
                <option value="College">College</option>
              </select>

              {/* Section Filter for College */}
              {filterOption === 'College' && (
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="select select-bordered select-md w-full mt-2 Text-gray-900 dark:text-white"
                >
                  <option value="">All Sections</option>
                  {collegeSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* List of Mobile Users */}
            <div className="mt-4 max-h-60 overflow-y-auto">
            {mobileUsers
  .filter((user) => {
    // Apply filters
    const matchesNameOrEmail =
      user.name.includes(mobileUserFilter) || user.email.includes(mobileUserFilter);
    const matchesSection = !sectionFilter || user.section === sectionFilter;
    const matchesEducationLevel =
      filterOption === 'All' || user.educationLevel === filterOption;

    return matchesNameOrEmail && matchesSection && matchesEducationLevel;
  })
  .map((user) => (
    <div key={user._id} className="flex items-center mb-2">
      <img
        src={user.profilePicture || 'https://img.daisyui.com/tailwind-css-component-profile-2@56w.png'}
        alt="User Avatar"
        className="w-8 h-8 rounded-full mr-3"
      />
      <span className="font-medium dark:text-white">{user.name}</span>
      <button
        onClick={() => {
          handleAddMember(user._id, 'MobileUser', viewCommunityId); 
        }}
        className="ml-auto btn btn-success btn-xs"
      >
        Add
      </button>
    </div>
  ))}


            </div>

          
          </div>
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
          <button onClick={handleLoadMore} className="btn btn-accent w-full">
            Load More
          </button>
        )}
      </div>

    {/* Floating Forum Posts Display */}
<div className=" right-0  top-16 bg-slate-200  shadow-4xl border border-gray-200 w-full sm:w-full md:w-full lg:w-full xl:w-72  h-screen hidden sm:hidden md:hidden  xl:block lg:fixed xl:fixed scrollbar-hide"
  onScroll={handleScroll}
>
  <h3 className="text-2xl font-semibold text-green-800  border-b border-yellow-500 text-left m-2 my-3">Latest Forum Posts</h3>

  <div className="overflow-y-auto h-96 p-2 my-3">
  {forumPosts.length === 0 ? (
    <p className="text-center text-gray-400">No forum posts found.</p>
  ) : (
    forumPosts.map((post) => (
      <div className="mb-6 pb-4 border-b border-gray-100 p-4  bg-gray-50 shadow-lg transition-colors rounded-xl"
        key={post._id}
        
      >
        <div className="flex items-start space-x-4">
          {/* Profile Picture Placeholder */}
          <div className="w-12 h-12  bg-gray-300 border-1 shadow-md "><img src= {post.logo}></img></div>

          {/* Post Content */}
          <div className="flex-1 space-y-2">
            {/* Community Name and Post Header */}
            <div className="flex flex-col justify-start">
              <p className="text-sm text-left text-green-800 font-semibold">{post.communityName}</p>
              <h4 className=" text-xs text-gray-500 text-left">• {new Date(post.datePosted).toLocaleDateString()}</h4>
            </div>
            <h4 className="text-lg text-left font-bold text-gray-900 transition-colors">
              {post.header}
            </h4>

            {/* Media Image with Click to Open Modal */}
            {post.mediaURL && (
                        <div
                          className="rounded-lg overflow-hidden max-h-48 cursor-pointer"
                          onClick={() => openImageModal(post.mediaURL)}
                        >
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
            <div className="grid grid-cols-2 justify-start mt-4">
              <div className="flex items-center space-x-1 ">
                <FaThumbsUp className="text-green-500 cursor-pointer transition-colors" />
                <span className='text-green-500'>{post.likes} Likes</span>
              </div>
              <div className="flex items-center space-x-1 ">
                <FaThumbsDown className="text-red-500 cursor-pointer transition-colors" />
                <span className='text-red-500'>{post.dislikes} Likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))
  )}

 
  </div>
</div>



      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-10 flex gap-4">

        <div className="">
        {/* Link to the Create Post Page */}
        <Link to="/createannouncement">
          <button 
            className="btn btn-neutral text-white rounded-lgp-2 shadow-lg transition-all  hover:bg-green-600 focus:outline-none"
          >
            <span className="text-xl">+</span> Post
          </button>
        </Link>
        </div>
        
        <div className="div">
        {/* Link to the Create Event Page */}
        <Link to="/event-calendar">
          <button 
            className="btn btn-neutral  text-white rounded-xl p-2 shadow-lg transition-all transform hover:scale-110 hover:bg-blue-600 focus:outline-none"
          >
            <span className="text-xl">+</span> Event
          </button>
        </Link>
        </div>
      </div>

      
      </div>

       {/* Modal for Expanded Image */}
  {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <div className="relative  rounded-lg shadow-lg w-[60vw] max-h-[80vh]">
               {/* Close button */}
           
            <button className="btn btn-circle btn-sm absolute top-2 right-2  " onClick={closeModal}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
            
            <div className="justify-center items-center">
              <img
                src={selectedImage}
                alt="Expanded Media"
                className="w-full h-[88vh] rounded-md shadow-lg"
              />
             
            </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default ViewCommunity;
