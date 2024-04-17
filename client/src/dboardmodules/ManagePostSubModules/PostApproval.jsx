import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './PostApproval.css'

export default function PostApproval({ adminType }) {
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingAnnouncements = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await axios.get('/pending-announcements', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingAnnouncements(response.data);
      setIsLoading(false);
      if (response.data.length === 0) {
        toast('No pending announcements found');
      } else {
        toast.success('Pending announcements fetched successfully');
      }
    } catch (error) {
      console.error('Error fetching pending announcements:', error);
      toast.error('Error fetching pending announcements');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAnnouncements();
  }, [adminType]); // Refetch pending announcements when adminType changes

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleApproval = async () => {
    try {
      const token = getToken();
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      if (!selectedAnnouncement) {
        throw new Error('No announcement selected');
      }
      await axios.put(`/update-announcement-status/${selectedAnnouncement._id}`, { status: 'approved' }, config);
      toast.success('Announcement approved successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error approving announcement:', error);
      toast.error('Error approving announcement');
    }
  };

  const handleRejection = async () => {
    try {
      const token = getToken();
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      if (!selectedAnnouncement) {
        throw new Error('No announcement selected');
      }
      await axios.put(`/update-announcement-status/${selectedAnnouncement._id}`, { status: 'rejected' }, config);
      toast.success('Announcement rejected successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting announcement:', error);
      toast.error('Error rejecting announcement');
    }
  };

  return (
    <div>
      <h2>Pending Announcements</h2>
      <button onClick={fetchPendingAnnouncements} className='approval_button'>Fetch Pending Announcements</button>
     
      {selectedAnnouncement && (
        <div className='approval_container'>
          
          {selectedAnnouncement.mediaUrl && (
            <div className='content_container'>
              {selectedAnnouncement.contentType && selectedAnnouncement.contentType.startsWith('image') && (
                <img src={selectedAnnouncement.mediaUrl} alt="Announcement Media" className='content'/>
              )}
              {selectedAnnouncement.contentType && selectedAnnouncement.contentType.startsWith('video') && (
                <video controls className='content'>
                  <source src={selectedAnnouncement.mediaUrl} type={selectedAnnouncement.contentType} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

          )}

        <div className="text_container">
          <div className="title_container">
          <h2>{selectedAnnouncement.header}</h2>
          <p>Posted by: {selectedAnnouncement.postedBy}</p>
          </div>
          <div className="body_container">
          <p>{selectedAnnouncement.body}</p>
          </div>
          </div>

          <div className="filler">

          </div>
          {isLoading ? (
        <p>Loading pending announcements...</p>
      ) : pendingAnnouncements.length > 0 ? (
        <ul>
       
          
             
                <div className='approval_buttons_container'>
                  <button onClick={handleApproval} className='approval_button'>Approve</button>
                  <button onClick={handleRejection} className='approval_button'>Reject</button>
                </div>
              
         
        </ul>
      ) : (
        <p>No pending announcements</p>
      )}
        </div>
      )}
    </div>
  );
}
