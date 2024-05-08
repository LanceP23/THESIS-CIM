import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RecentPostCommunity({ communityId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // Fetch recent posts for the specified community ID
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

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold mb-4">Recent Posts for Community</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && (
        <ul>
          {posts.map((post) => (
            <li key={post._id} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{post.header}</h3>
              <p className="text-gray-700 mb-4">{post.body}</p>
              {/* Render media if available */}
              {post.mediaUrl && (
                <div>
                  {post.contentType.startsWith('image') ? (
                    <img src={post.mediaUrl} alt="Post Media" className="max-w-xs mx-auto mb-4" />
                  ) : post.contentType.startsWith('video') ? (
                    <video controls className="max-w-xs mx-auto mb-4">
                      <source src={post.mediaUrl} type={post.contentType} />
                    </video>
                  ) : post.contentType.startsWith('audio') ? (
                    <audio controls className="max-w-xs mx-auto mb-4">
                      <source src={post.mediaUrl} type={post.contentType} />
                    </audio>
                  ) : (
                    <p className="text-gray-500">No media available</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
