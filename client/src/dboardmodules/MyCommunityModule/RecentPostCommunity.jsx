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
    <div className="  ">
      

      <div className=" p-14 max-h-96 overflow-auto">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && (

        
      <div className=''>
        {posts.map((post) => (
          <div key={post._id} className="card lg:card-side bg-slate-100 shadow-xl p-0 mb-3 transition-transform duration-300 ease-in-out transform hover:scale-110">
          
      <figure>
         {post.contentType && post.contentType.startsWith('image') ? (
                    <img src={post.mediaUrl} alt="Post Media" className="max-w-xl h-full" />
                  ) : post.contentType && post.contentType.startsWith('video') ? (
                    <video controls className="max-w-full mx-auto mb-4">
                      <source src={post.mediaUrl} type={post.contentType} />
                    </video>
                  ) : post.contentType && post.contentType.startsWith('audio') ? (
                    <audio controls className="max-w-full mx-auto mb-4">
                      <source src={post.mediaUrl} type={post.contentType} />
                    </audio>
                  ) : (
                    <p className="flex justify-center items-center border-2 border-white">No media available</p>
                  )}
      </figure>
      <div className="card-body p-2">
        <h2 className="card-title border-b-2 text-green-600 border-yellow-400 py-1">{post.header}</h2>
        <p className=' max-h-40 max-w-xs overflow-auto bg-slate-100  text-left m-0 border-white border-2 shadow-lg'>{post.body}</p>
        
      </div>
   
      </div>

      ))}
      </div>
      )}
      </div>
    </div>
  );
}
