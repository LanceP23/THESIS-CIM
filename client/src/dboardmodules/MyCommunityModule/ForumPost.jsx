import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

const ForumPost = ({ communityId }) => {
  const [forumPosts, setForumPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayedPosts, setDisplayedPosts] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchForumPosts = async () => {
    try {
      const response = await axios.get(`/${communityId}/forum-posts`);
      console.log("Fetching posts for communityId:", communityId);
      setForumPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      toast.error('Failed to load forum posts');
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this forum post?")) {
      try {
        // Call the DELETE API to delete the post
        await axios.delete(`/${communityId}/forum-posts/${postId}`);
  
        // Update the local state to remove the deleted post
        setForumPosts(forumPosts.filter(post => post._id !== postId));
  
        // Notify the user
        toast.success('Forum post deleted successfully');
      } catch (error) {
        console.error('Error deleting forum post:', error);
        toast.error('Failed to delete forum post');
      }
    }
  };
  

  

  useEffect(() => {
    if (communityId) {
      fetchForumPosts();
    }
  }, [communityId]);

  const openModal = (mediaURL) => {
    setSelectedImage(mediaURL);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const loadMorePosts = () => {
    setDisplayedPosts(displayedPosts + 5);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {loading ? (
        <p>Loading forum posts...</p>
      ) : forumPosts.length > 0 ? (
        <div>
          <ul className="space-y-6 max-h-[500px] overflow-y-auto">
            {forumPosts.slice(0, displayedPosts).map((post) => (
              <li key={post._id} className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-lg text-gray-800">{post.postedBy}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(post.datePosted).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl text-left font-semibold text-gray-900">{post.header}</h3>
                <p className="text-gray-700 mt-2 text-left">{post.body}</p>

                {post.mediaURL && (
                  <img
                    src={post.mediaURL}
                    alt="Post Media"
                    className="w-[30vw] max-h-[40vh] object-cover cursor-pointer mt-4"
                    onClick={() => openModal(post.mediaURL)}
                  />
                )}

                <div className="flex justify-between items-center mt-4 space-x-4">
                  <div className="space-x-2">
                    <span className="text-gray-500 font-semibold">
                      <FontAwesomeIcon className="text-green-500 text-2xl" icon={faThumbsUp} /> {post.likes} Likes
                    </span>
                    <span className="text-gray-500 font-semibold">
                      <FontAwesomeIcon className="text-red-500 text-2xl" icon={faThumbsDown} /> {post.dislikes} Dislikes
                    </span>
                  </div>
                  <button
                    className="btn-sm btn btn-error"
                    onClick={() => deletePost(post._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {displayedPosts < forumPosts.length && (
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={loadMorePosts}
            >
              Load More
            </button>
          )}
        </div>
      ) : (
        <p>No forum posts available.</p>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          
          <div className="relative  rounded-lg shadow-lg w-[60vw] max-h-[80vh] ">
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
};

export default ForumPost;
