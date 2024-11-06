import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
export default function PostApproval({ adminType }) {
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");


  const openModal = (imgSrc) => {
    setSelectedImage(imgSrc);
    setModalOpen(true);
    document.body.style.overflow = "hidden"; // Disable scrolling
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage("");
    document.body.style.overflow = "auto"; // Re-enable scrolling
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto"; // Reset scroll when component unmounts
    };
  }, []);  

  
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
      <h2 className=' border-b-2 border-black py-2 m-2 font-bold'>Pending Announcements</h2>
      <button onClick={fetchPendingAnnouncements} className='btn btn-wide btn-success'>Fetch Pending Announcements</button>
      <div className=" flex flex-col sm:flex-col md:flex-col lg:flex-col xl:flex-row justify-evenly my-3 ">
      {selectedAnnouncement && (
         
         <div className="card md:card-side lg:card-side xl:card-side bg-slate-100 shadow-xl p-0">
          
           <figure>
           {selectedAnnouncement.mediaUrl && (
             <div className='flex'>
               {selectedAnnouncement.contentType && selectedAnnouncement.contentType.startsWith('image') && (
                 <img src={selectedAnnouncement.mediaUrl} alt="Announcement Media" className=' max-w-xl  h-full shadow-xl cursor-pointer '  onClick={() => openModal(selectedAnnouncement.mediaUrl)} />
               )}
               {selectedAnnouncement.contentType && selectedAnnouncement.contentType.startsWith('video') && (
                 <video controls className='max-w-xl h-full'>
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
           <h2 className="card-title text-green-700 border-b-2 border-yellow-400 "> {selectedAnnouncement.header}</h2>
           <p className=' text-left text-gray-700 p-2 rounded-md'> <strong>Posted by: {selectedAnnouncement.postedBy}</strong></p>
           <p className=' text-left text-gray-700 p-2 rounded-md'>{selectedAnnouncement.body}</p>
 
           <div className="card-actions justify-end grid grid-cols-2">
              <button onClick={handleApproval} className='btn btn-success'>Approve</button>
                   <button onClick={handleRejection} className='btn btn-error'>Reject</button>
                   </div>
 
           </div>
          
         </div>
       )}
      {isLoading ? (
        <p >Loading pending announcements...</p>
        
      ) : pendingAnnouncements.length > 0 ? (
        <div className="bg-white p-1 m-2 rounded-lg max-h-72 overflow-auto xl:w-2/5 w-full">
        <ul>
       
          {pendingAnnouncements.slice().reverse().map((announcement) => (
        
            <li key={announcement._id} onClick={() => handleAnnouncementClick(announcement)} className='' >
              <div className="bg-white shadow-lg rounded-md m-3 p-2  transition-transform duration-300 ease-in-out transform hover:scale-95 cursor-pointer">
              <h3 className=' text-2xl m-1 hover:text-green-600  '> Header: <strong>{announcement.header}</strong></h3>
              <h3 className='hover:text-green-600  '>Posted by: <strong>{announcement.postedBy}</strong> </h3>
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
      
      </div>

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
            {/* Modal image */}
            <div className=" justify-center items-center">
              <img src={selectedImage} alt="Selected" className=" w-full h-[88vh] rounded-md shadow-lg" />
            </div>
          </div>
        </div>
      )}
                
    </div>
  );
}