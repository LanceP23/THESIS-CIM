import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

export default function RecentPostCommunity({ communityId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null); // For handling "See More" functionality

  // Helper function to retrieve the token from cookies
  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`/announcements/${communityId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Retrieve only the last 3 posts
        const lastThreePosts = response.data.slice(-3);
        setPosts(lastThreePosts);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchPosts();
  }, [communityId]);

  // Function to toggle expanded content for "See More"
  const handleToggleExpand = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  return (
    <div className="p-4 max-w-full md:max-w-2xl mx-auto">
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      {!loading && !error && (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="card bg-slate-100 shadow-sm p-3 mb-4 transition-transform duration-200 ease-in-out transform hover:scale-105"
            >
              <figure>
                {post.contentType && post.contentType.startsWith('image') ? (
                  <img src={post.mediaUrl} alt="Post Media" className="w-full h-40 object-cover rounded-md" />
                ) : post.contentType && post.contentType.startsWith('video') ? (
                  <video controls className="w-full h-40 object-cover rounded-md mb-3">
                    <source src={post.mediaUrl} type={post.contentType} />
                  </video>
                ) : post.contentType && post.contentType.startsWith('audio') ? (
                  <audio controls className="w-full mb-3 rounded-md">
                    <source src={post.mediaUrl} type={post.contentType} />
                  </audio>
                ) : (
                  <div className="text-center p-4 border-2 border-white rounded-md">No media available</div>
                )}
              </figure>
              <div className="card-body p-2">
                <h2 className="card-title text-green-600 border-b-2 pb-2 border-yellow-400 text-lg">{post.header}</h2>
                <p className="text-gray-600 text-sm text-justify">
                  {/* Show full content if the post is expanded */}
                  {expandedPost === post._id ? post.body : `${post.body.slice(0, 100)}...`}
                </p>
                {post.body.length > 100 && (
                  <button
                    className="text-yellow-500 text-xs mt-2 block"
                    onClick={() => handleToggleExpand(post._id)}
                  >
                    {expandedPost === post._id ? 'See Less' : 'See More'}
                  </button>
                )}
              </div>
              <div className="card-footer p-2 flex justify-between items-center bg-slate-50 rounded-lg mt-2">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center text-green-500">
                    <FontAwesomeIcon className="mr-1 text-lg" icon={faThumbsUp} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center text-red-500">
                    <FontAwesomeIcon className="mr-1 text-lg" icon={faThumbsDown} />
                    <span>{post.dislikes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
