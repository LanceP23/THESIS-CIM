import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import PostApproval from '../dboardmodules/ManagePostSubModules/PostApproval';

export default function CreateAnnouncement() {
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState(null);
  const [showPostApprovalModal, setShowPostApprovalModal] = useState(false); // modal visibility
  const[adminType,setAdminType] = useState('');
  const navigate = useNavigate();

  const adminType2 = localStorage.getItem('adminType');
  
  useEffect(() => {
    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('/check-auth');
            if (!response.data.authenticated) {
                // If not authenticated, redirect to login
                navigate('/login');
            } else {
                // If authenticated, set the admin type
                setAdminType(localStorage.getItem('adminType'));
            }
        } catch (error) {
            console.error('Error checking authentication status:', error);
        }
    };

    checkAuthStatus();
}, [navigate]);

  const handleHeaderChange = (e) => {
    setHeader(e.target.value);
  };

  const handleBodyChange = (e) => {
    setBody(e.target.value);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
  };

  const handleSubmit = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      if (!token) {
        throw new Error('No token found');
      }

      const formData = new FormData();
      formData.append('header', header);
      formData.append('body', body);
      formData.append('media', media);

      const response = await axios.post('/announcements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token.split('=')[1]}`, // Extract token value from cookie
        },
      });

      
      if (adminType2 !== 'School Owner') {
        toast.success('Your post is pending approval');
      } else {
        toast.success('Announcement created successfully');
      }

      // Reset form fields
      setHeader('');
      setBody('');
      setMedia(null);

    } catch (error) {
      // Show toast message on error
      toast.error('Error creating announcement');
      console.error('Error creating announcement:', error);
    }
  };

  // Function to toggle modal visibility
  const toggleModal = () => {
    setShowPostApprovalModal(!showPostApprovalModal);
  };

  return (
    <div className="container">
      <Sidebar adminType={adminType2} />
      <h2>Create Announcement</h2>
      <div>
        <label className="label" htmlFor="header">Header:</label>
        <input
          className="input-field"
          type="text"
          id="header"
          value={header}
          onChange={handleHeaderChange}
        />
      </div>
      <div>
        <label className="label" htmlFor="body">Body:</label>
        <textarea
          className="textarea-field"
          id="body"
          value={body}
          onChange={handleBodyChange}
        />
      </div>
      <div className="file-field">
        <label className="label" htmlFor="media">Media:</label>
        <input
          className="input-field"
          type="file"
          id="media"
          accept="image/*, video/*"
          onChange={handleMediaChange}
        />
      </div>
      <button className="button" onClick={handleSubmit}>Post</button>
      {adminType === 'School Owner' && (
        <button className="button" onClick={toggleModal}>Open Post Approval</button>
      )}
      {showPostApprovalModal && <PostApprovalModal />}
    </div>
  );

  
  function PostApprovalModal() {
    return (
      <div className="post-approval-container">
        <PostApproval closeModal={toggleModal} adminType={adminType} />
      </div>
    );
  }
}
