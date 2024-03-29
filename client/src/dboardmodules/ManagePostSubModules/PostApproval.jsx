import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
      <button onClick={fetchPendingAnnouncements}>Fetch Pending Announcements</button>
      {isLoading ? (
        <p>Loading pending announcements...</p>
      ) : pendingAnnouncements.length > 0 ? (
        <ul>
          {pendingAnnouncements.map((announcement) => (
            <li key={announcement._id} onClick={() => handleAnnouncementClick(announcement)}>
              <h3>{announcement.header}</h3>
              <p>Posted by: {announcement.postedBy}</p>
              {selectedAnnouncement && selectedAnnouncement._id === announcement._id && (
                <div>
                  <button onClick={handleApproval}>Approve</button>
                  <button onClick={handleRejection}>Reject</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending announcements</p>
      )}
      {selectedAnnouncement && (
        <div>
          <h2>{selectedAnnouncement.header}</h2>
          <p>Posted by: {selectedAnnouncement.postedBy}</p>
          <p>{selectedAnnouncement.body}</p>
          {selectedAnnouncement.media && (
            <div>
              {selectedAnnouncement.media.contentType.startsWith('image') && (
                <img src={`data:${selectedAnnouncement.media.contentType};base64,${selectedAnnouncement.media.data.toString('base64')}`} alt="Media" />
              )}
              {selectedAnnouncement.media.contentType.startsWith('video') && (
                <video controls>
                  <source src={`data:${selectedAnnouncement.media.contentType};base64,${selectedAnnouncement.media.data.toString('base64')}`} type={selectedAnnouncement.media.contentType} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
