import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForumPost = ({ communityId }) => {
  const [forumPosts, setForumPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayedPosts, setDisplayedPosts] = useState(5); // Number of posts to display initially

  // Fetch forum posts from the API
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

  // Delete a post
  const deletePost = async (postId) => {
    try {
      await axios.delete(`/${communityId}/forum-posts/${postId}`); // Adjust the API endpoint as necessary
      setForumPosts(forumPosts.filter(post => post._id !== postId)); // Remove post from state
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Fetch the posts when the component mounts or communityId changes
  useEffect(() => {
    if (communityId) {
      fetchForumPosts();
    }
  }, [communityId]);

  // Render media based on mediaURL
  const renderMedia = (mediaURL) => {
    if (!mediaURL) return null;
  
    // Extract file extension from the URL
    const fileExtension = mediaURL.split('.').pop().toLowerCase();
  
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension)) {
      return (
        <img
          src={mediaURL}
          alt="Post Media"
          className="w-[50vw] max-h-[55vh] object-cover cursor-pointer mt-4"
          onClick={() => openModal(mediaURL)} // Placeholder for modal function
        />
      );
    }
  
    if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return (
        <figure className="mt-4">
          <video controls className="max-w-xl h-full">
            <source src={mediaURL} type={`video/${fileExtension}`} />
          </video>
        </figure>
      );
    }
  
    if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
      return (
        <audio controls className="max-w-xl h-full mt-4">
          <source src={mediaURL} type={`audio/${fileExtension}`} />
        </audio>
      );
    }
  
    // Default message if no valid media type is detected
    return (
      <p className="flex justify-center items-center border-2 border-white max-w-xl h-full mt-4">
        No media available
      </p>
    );
  };

  // Load more posts
  const loadMorePosts = () => {
    setDisplayedPosts(displayedPosts + 5); // Increase the number of displayed posts
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
                <h3 className="text-xl font-semibold text-gray-900">{post.header}</h3>
                <p className="text-gray-700 mt-2">{post.body}</p>
                <img src={post.mediaURL}/>

                <div className="flex justify-start items-center mt-4 space-x-4">
                  <span className="text-gray-500 font-semibold">👍 {post.likes}</span>
                  <span className="text-gray-500 font-semibold">👎 {post.dislikes}</span>
                  <button 
                    className="text-red-600 hover:underline"
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
    </div>
  );
};

export default ForumPost;
