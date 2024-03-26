import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Import toast from react-hot-toast


export default function CreateAnnouncement() {
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState(null);

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
    const formData = new FormData();
    formData.append('header', header);
    formData.append('body', body);
    formData.append('media', media);

    // Check if media file is missing
    if (!media) {
      toast.error('Please select a file');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      const response = await axios.post('/announcements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set content type for form data
          Authorization: `Bearer ${token}`, // Include JWT token in Authorization header
        },
      });

      // Show toast message on successful creation
      toast.success('Announcement created successfully');

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

  return (
    <div className="container">
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
    </div>
  );
}
