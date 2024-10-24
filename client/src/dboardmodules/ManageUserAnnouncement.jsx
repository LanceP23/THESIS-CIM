import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import toast from 'react-hot-toast'; 
import './ManageUserAnnouncement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
const ManageUserAnnouncement = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [editHeader, setEditHeader] = useState('');
  const [editBody, setEditBody] = useState('');
  const [postComments, setPostComments] = useState({});
  // Function to open the modal and display the selected image
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  
  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

    // Cleanup: reset body scroll when component unmounts
    useEffect(() => {
      return () => {
        document.body.style.overflow = "auto";
      };
    }, []);
   
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const token = getToken();
        const response = await axios.get('/fetch-user-announcements', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user announcements:', error);
        setLoading(false);
      }
    };
    fetchUserPosts();
  }, []);
  const handleEdit = (post) => {
    setEditingPost(post._id);
    setEditHeader(post.header);
    setEditBody(post.body);
  };
  const handleUpdate = async (postId) => {
    try {
      const token = getToken();
      const response = await axios.put(`/update-post/${postId}`, {
        header: editHeader,
        body: editBody
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setUserPosts(prevPosts => prevPosts.map(post => post._id === postId ? { ...post, header: editHeader, body: editBody } : post));
        setEditingPost(null);
        toast.success('Updated Successfully.');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement.');
    }
  };
  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) {
      return; // Exit if the user cancels the deletion
    }
    try {
      const token = getToken();
      const response = await axios.delete(`/delete-post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        toast.success('Announcement deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement.');
    }
  };
  const fetchComments = async (postId) => {
    try {
      const token = getToken();
      const response = await axios.get(`/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPostComments((prevComments) => ({
        ...prevComments,
        [postId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  const handleDeleteComment = async (commentId, postId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) {
      return; 
    }
    try {
      const token = getToken();
      const response = await axios.delete(`/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setPostComments((prevComments) => ({
          ...prevComments,
          [postId]: prevComments[postId].filter(comment => comment._id !== commentId)
        }));
        toast.success('Comment deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment.');
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }
   
 
   // Function to open modal and disable scrolling
   const openModal = (imgSrc) => {
     setSelectedImage(imgSrc);
     setModalOpen(true);
     document.body.style.overflow = "hidden"; // Disable scrolling
   };
 
   // Function to close modal and enable scrolling
   const closeModal = () => {
     setModalOpen(false);
     setSelectedImage("");
     document.body.style.overflow = "auto"; // Re-enable scrolling
   };
 
   // Cleanup: reset body scroll when component unmounts
  
 
  return (
     <div className="p-4 my-2 max-w-full h-auto rounded-2 animate-fade-in">
      <h2 className="border-b border-gray-500 py-2 font-bold mb-2">Your Announcements</h2>
      <div className="max-h-[700px] overflow-auto">
        {userPosts.length === 0 ? (
          <p>No announcements found.</p>
        ) : (
          userPosts.map((post) => (
            <div key={post._id} className="w-full my-5 p-4 bg-white rounded-lg shadow-sm border-3">
              {editingPost === post._id ? (
                <div className="edit-form">
                  <label className="label text-red-500 opacity-50" htmlFor="expirationDate">*Title:</label>
                  <input
                    type="text"
                    value={editHeader}
                    onChange={(e) => setEditHeader(e.target.value)}
                    className="input input-bordered input-success input-md w-full text-gray-700 bg-white rounded-md shadow-xl mb-2"
                  />
                  <label className="label text-red-500 opacity-50" htmlFor="expirationDate">*Body:</label>
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="textarea textarea-success w-full text-gray-700 bg-white rounded-md shadow-xl mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleUpdate(post._id)} className="btn btn-info">Update</button>
                    <button onClick={() => setEditingPost(null)} className="btn btn-error">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2 text-2xl text-green-700 font-bold text-left border-b border-yellow-400">{post.header}</div>
                  <div className="mb-2 font-bold text-left text-gray-700">{post.body}</div>

                  {/* Image */}
                  {post.mediaUrl && post.contentType && post.contentType.startsWith('image') && (
                    <div className="w-full cursor-pointer">
                      <img
                        src={post.mediaUrl}
                        alt={post.header}
                        className="w-auto h-72 shadow-lg"
                        onClick={() => openModal(post.mediaUrl)}
                      />
                    </div>
                  )}

                  {/* Video */}
                  {post.mediaUrl && post.contentType && post.contentType.startsWith('video') && (
                    <div className="w-full">
                      <video controls className="w-auto max-h-96 shadow-lg">
                        <source src={post.mediaUrl} type={post.contentType} onClick={() => openModal(post.mediaUrl)} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {/* Audio */}
                  {post.mediaUrl && post.contentType && post.contentType.startsWith('audio') && (
                    <div className="w-full">
                      <audio controls className="w-auto max-h-96 shadow-lg">
                        <source src={post.mediaUrl} type={post.contentType}  onClick={() => openModal(post.mediaUrl)}/>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Likes and Dislikes */}
                  <div className="grid grid-cols-2 my-1 shadow-inner shadow-sm">
                    <div className="max-w-[50vw] p-3 shadow-inner">
                      <FontAwesomeIcon className="text-green-500 text-2xl" icon={faThumbsUp} />
                      <label className="mx-2"> Likes</label>
                    </div>
                    <div className="max-w-[50vw] p-3 shadow-inner">
                      <FontAwesomeIcon className="text-green-500 text-2xl" icon={faThumbsDown} />
                      <label className="mx-2"> Dislikes</label>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="comments-section mt-4">
                    <h4 className="text-lg font-semibold">Comments:</h4>
                    <button onClick={() => fetchComments(post._id)} className="btn btn-sm btn-success">Load Comments</button>
                    {postComments[post._id] && postComments[post._id].length > 0 ? (
                      <ul className="comments-list mt-2">
                        {postComments[post._id].map((comment) => (
                          <li key={comment._id} className="bg-slate-200 p-2 mb-2 rounded shadow flex ">
                            <div className="div text-left">
                            <p className="text-gray-700">{comment.text}</p>
                            <p className="text-sm text-gray-500">- {comment.userId.name}, {new Date(comment.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="mx-3">
                            <button
                              onClick={() => handleDeleteComment(comment._id, post._id)}
                              className="btn btn-error btn-sm mt-2"
                            >
                              <FaTrashAlt />
                            </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No comments yet.</p>
                    )}
                  </div>

                  {/* Post Info and Edit/Delete */}
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <div className="mb-2">
                      <span>Posted on: {new Date(post.createdAt).toLocaleString()}</span>
                      <span>Status: {post.status}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(post)} className="btn btn-info">
                        <FaEdit /> Edit Post
                      </button>
                      <button onClick={() => handleDelete(post._id)} className="btn btn-error">
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg shadow-lg w-[60vw] max-h-[70vh] p-3">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 focus:outline-none text-4xl"
              >
                &times;
              </button>
              <div className="flex justify-center items-center">
                <img src={selectedImage} alt="Selected" className="w-full h-[60vh] rounded-md shadow-lg" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ManageUserAnnouncement;