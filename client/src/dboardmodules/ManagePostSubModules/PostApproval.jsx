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
      <h2 className=' border-b-2 border-black py-2 m-2'>Pending Announcements</h2>
      <button onClick={fetchPendingAnnouncements} className='btn btn-wide btn-success'>Fetch Pending Announcements</button>
      <div className="">
      {isLoading ? (
        <p >Loading pending announcements...</p>

        
      ) : pendingAnnouncements.length > 0 ? (
        <div className="bg-white p-1 m-2 rounded-lg max-h-72 overflow-auto w-full">
        <ul>
       
          {pendingAnnouncements.map((announcement) => (
        
            <li key={announcement._id} onClick={() => handleAnnouncementClick(announcement)} >
              <div className="bg-white shadow-lg rounded-md m-3 p-2 transition-transform duration-300 ease-in-out transform hover:scale-95 active:bg-gray-500">
              <h3 className=' text-2xl m-1'> Header: <strong>{announcement.header}</strong></h3>
              <h3 className=''>Posted by: {announcement.postedBy}</h3>
              </div>
              {selectedAnnouncement && selectedAnnouncement._id === announcement._id && (
                <div>
               
                </div>
              )}
            </li>
          ))}
         
           
        </ul>
        </div>
      ) : (
        <p>No pending announcements</p>
      )}
      {selectedAnnouncement && (
         

        <div className="card lg:card-side bg-slate-100 shadow-xl p-0">
         
          <figure>
          {selectedAnnouncement.mediaUrl && (
            <div className='flex'>
              {selectedAnnouncement.contentType && selectedAnnouncement.contentType.startsWith('image') && (
                <img src={selectedAnnouncement.mediaUrl} alt="Announcement Media" className=' w-full h-auto shadow-xl ' />
              )}
              {selectedAnnouncement.contentType && selectedAnnouncement.contentType.startsWith('video') && (
                <video controls className='w-full h-full'>
                  <source src={selectedAnnouncement.mediaUrl} type={selectedAnnouncement.contentType} />
                  Your browser does not support the video tag.
                </video>
              )}
              {selectedAnnouncement.contentType && selectedAnnouncement.contentType.startsWith('audio') && (
                <audio controls className='w-full h-full'>
                  <source src={selectedAnnouncement.mediaUrl} type={selectedAnnouncement.contentType} />
                  Your browser does not support the video tag.
                </audio>
              )}
            </div>
          )}
          </figure>

          <div className="card-body">
          <h2 className="card-title"> Title: {selectedAnnouncement.header}</h2>
          <p className=' text-left'> <strong>Posted by: {selectedAnnouncement.postedBy}</strong></p>
          <p className=' bg-white p-1 rounded-md shadow-2xl'>{selectedAnnouncement.body}</p>

          <div className="card-actions justify-end grid grid-cols-2">
             <button onClick={handleApproval} className='btn btn-success'>Approve</button>
                  <button onClick={handleRejection} className='btn btn-error'>Reject</button>
                  </div>

          </div>
         
        </div>
      )}
      </div>
    </div>
  );
}
