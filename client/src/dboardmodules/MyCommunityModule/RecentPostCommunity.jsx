import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

export default function RecentPostCommunity({ communityId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleToggleExpand = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="p-4 w-full">
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      {!loading && !error && (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="card bg-slate-200 shadow-2xl p-0 transition-transform duration-300 ease-in-out transform hover:scale-105 sm:card md:card-side lg:card-side xl:card-side"
            >
              <figure>
                {post.contentType && post.contentType.startsWith('image') ? (
                  <img
                    src={post.mediaUrl}
                    alt="Post Media"
                    className="w-[50vw] max-h-[55vh] object-cover cursor-pointer"
                    onClick={() => openModal(post.mediaUrl)}
                  />
                ) : post.contentType && post.contentType.startsWith('video') ? (
                  <video controls className="max-w-xl h-full">
                    <source src={post.mediaUrl} type={post.contentType} />
                  </video>
                ) : post.contentType && post.contentType.startsWith('audio') ? (
                  <audio controls className="max-w-xl h-full">
                    <source src={post.mediaUrl} type={post.contentType} />
                  </audio>
                ) : (
                  <div className="flex justify-center items-center border-2 border-white max-w-xl h-full">No media available</div>
                )}
              </figure>
              <div className="w-full flex flex-col">
                <div className="card-body p-2">
                  <h2 className="card-title text-green-600 border-b-2 pb-2 border-yellow-400 text-lg">{post.header}</h2>
                  <div className="div">
                    <p className="text-gray-600 text-sm text-justify">
                      {expandedPost === post._id ? post.body : `${post.body.slice(0, 100)}...`}
                    </p>
                    {post.body.length > 100 && (
                      <div className="flex justify-center">
                        <button
                          className="text-yellow-500 text-xs mt-2 block border-b border-yellow-500"
                          onClick={() => handleToggleExpand(post._id)}
                        >
                          {expandedPost === post._id ? 'See Less' : 'See More'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 shadow-inner">
                  <div className="max-w-[50vw] p-3 shadow-inner">
                    <FontAwesomeIcon className="mr-1 text-lg text-green-500" icon={faThumbsUp} />
                    <span className='text-green-500'>{post.likes} Likes</span>
                  </div>
                  <div className="max-w-[50vw] p-3 shadow-inner">
                    <FontAwesomeIcon className="mr-1 text-lg text-red-500" icon={faThumbsDown} />
                    <span className='text-red-500'>{post.dislikes} Dislikes</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            <img src={selectedImage} alt="Expanded Post Media" className="w-full h-[88vh] rounded-md shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
