import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import './ManageUserAnnouncement.css';

const ManageUserAnnouncement = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

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

  const handleEdit = (postId) => {
    // no functionality yet hehe
    console.log('Edit post with ID:', postId);
  };

  const handleDelete = (postId) => {
    // no functions yet
    console.log('Delete post with ID:', postId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="manage-announcements-container">
      <h2>Your Announcements</h2>
      {userPosts.length === 0 ? (
        <p>No announcements found.</p>
      ) : (
        userPosts.map(post => (
          <div key={post._id} className="announcement-card">
            <div className="announcement-header">{post.header}</div>
            <div className="announcement-body">{post.body}</div>
            {post.mediaUrl && post.contentType && post.contentType.startsWith('image') && (
              <div className="announcement-media">
                <img src={post.mediaUrl} alt={post.header} className='max-w-xl h-full' />
              </div>
            )}
            {post.mediaUrl && post.contentType && post.contentType.startsWith('video') && (
              <div className="announcement-media">
                <video controls className='max-w-xl h-full'>
                  <source src={post.mediaUrl} type={post.contentType} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {post.mediaUrl && post.contentType && post.contentType.startsWith('audio') && (
              <div className="announcement-media">
                <audio controls className='max-w-xl h-full'>
                  <source src={post.mediaUrl} type={post.contentType} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <div className="announcement-footer">
              <div>
                <span>Posted on: {new Date(post.createdAt).toLocaleString()}</span>
                <span>Status: {post.status}</span>
              </div>
              <div className="announcement-actions">
                <button onClick={() => handleEdit(post._id)} className="btn btn-edit">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(post._id)} className="btn btn-delete">
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ManageUserAnnouncement;
