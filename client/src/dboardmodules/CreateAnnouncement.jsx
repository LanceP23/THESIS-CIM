import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import PostApproval from '../dboardmodules/ManagePostSubModules/PostApproval';
import './CreateAnnouncement.css';
import { Container, Row, Tabs, Tab } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import { initializeApp } from 'firebase/app';
import 'firebase/storage';
import { getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage';
import CreateEvent from './CreateEvent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../context/userContext';


const firebaseConfig = {
  apiKey: "AIzaSyAQZQtWzdKepDwzzhOAw_F8A4xkhtwz9p0",
  authDomain: "cim-storage.firebaseapp.com",
  projectId: "cim-storage",
  storageBucket: "cim-storage.appspot.com",
  messagingSenderId: "616767248215",
  appId: "1:616767248215:web:b554a837f3229fdc155012",
  measurementId: "G-YN9S75JSNB"
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

export default function CreateAnnouncement() {
  const {user} = useContext(UserContext);
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null); // For image preview
  const [showPostApprovalModal, setShowPostApprovalModal] = useState(false); // modal visibility
  const [adminType, setAdminType] = useState('');
  const [approvedAnnouncements, setApprovedAnnouncements] = useState([]);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [visibility, setVisibility] = useState({
    everyone: false,
    staff: false,
    faculty: false,
    students: false
  });
  const [postingDate, setPostingDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [userCommunities, setUserCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');

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

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  useEffect(() => {
    const fetchApprovedAnnouncements = async () => {
      try {
        const token = getToken();
        const response = await axios.get('/approved-announcements', {
          headers:{
            Authorization: `Bearer ${token}`,
          },
        });
        setApprovedAnnouncements(response.data);
      } catch (error) {
        console.error('Error fetching approved announcements:', error);
      }
    };

    fetchApprovedAnnouncements();
  }, []);

  useEffect(() => {
    const fetchUserCommunities = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`/view-community/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserCommunities(response.data);
      } catch (error) {
        console.error('Error fetching user communities:', error);
      }
    };
  
    if (user && user.id) {
      fetchUserCommunities();
    }
  }, [user]);

  const PromiseRenderer = ({ promise }) => {
    const [communityName, setCommunityName] = useState(null);
    
    useEffect(() => {
      promise.then((name) => {
        setCommunityName(name);
      });
    }, [promise]);
  
    return communityName && <p><strong>Community:</strong> {communityName}</p>;
  };

  const handleHeaderChange = (e) => {
    setHeader(e.target.value);
  };

  const handleBodyChange = (e) => {
    setBody(e.target.value);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    // Display image preview
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if(submitting){
      return;
    }
    try {
      setSubmitting(true);
      toast.loading('Uploading...');
      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      if (!token) {
        throw new Error('No token found');
      }
  
      // Ensure media file is selected
      if (!media) {
        throw new Error('No media file selected');
      }
  
      const storageRef = ref(storage, media.name);
      // Upload the media file to Firebase storage
      const uploadTask = uploadBytesResumable(storageRef, media);
  

      uploadTask.on('state_changed',
        (snapshot) => {
        },
        (error) => {
          // Handle unsuccessful upload
          toast.dismiss();
          throw new Error('Error uploading media:', error);
        },
        async () => {
          // Handle successful upload
          try {
            // Get the download URL for the uploaded file
            const mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
  
            // Create form data with announcement details
            const formData = new FormData();
            formData.append('header', header);
            formData.append('body', body);
            formData.append('mediaUrl', mediaUrl);
            formData.append('visibility', JSON.stringify(visibility));
            formData.append('postingDate', postingDate);
            formData.append('expirationDate', expirationDate);
            formData.append('communityId', selectedCommunity);
  
            // Post the announcement data to your server
            const response = await axios.post('/announcements', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token.split('=')[1]}`,
              },
            });
  
            // Reset form fields and image preview after successful submission
            setHeader('');
            setBody('');
            setMedia(null);
            setMediaPreview(null);
            setVisibility('');
            setPostingDate('')
            setExpirationDate('')
            setSelectedCommunity('');
  
            // Show success message
            if (adminType2 !== 'School Owner') {
              toast.success('Your post is pending approval');
            } else {
              toast.success('Announcement created successfully');
            }
          } catch (error) {
            // Handle errors during announcement submission
            toast.error('Error creating announcement');
            console.error('Error creating announcement:', error);
          }finally{
            setSubmitting(false);
          }
        }
      );
    } catch (error) {
      // Handle errors in token retrieval or media selection
      toast.error('Error creating announcement');
      console.error('Error creating announcement:', error);
    }
  };

  const getCommunityName = async (communityId) => {
    try {
      const response = await axios.get(`/get-community-name/${communityId}`);
      return response.data.name;
    } catch (error) {
      console.error('Error fetching community name:', error);
      // Handle error appropriately, e.g., show error message to the user
      return null;
    }
  };

  const toggleModal = () => {
    setShowPostApprovalModal(!showPostApprovalModal);
  };

  const handleVisibilityChange = (e) => {
    const { name, checked } = e.target;
    setVisibility(prevVisibility => ({
      ...prevVisibility,
      [name]: checked
    }));
  };

  const handlePostingDateChange = (e) => {
    setPostingDate(e.target.value);
  };
  
  const handleExpirationDateChange = (e) => {
    setExpirationDate(e.target.value);
  };

  const handleCommunityChange = (event) => {
    setSelectedCommunity(event.target.value);
  };

  const renderVisibilityOptions = () => {
    // Check if the admin type is 'School Owner'
    if (adminType === 'School Owner') {
      return (
        <div className="flex flex-col my-3">
          <div className="label my-0 py-0">
            <label className="label text-gray-700" htmlFor="body">Visibility:</label>
          </div>
          <div className="radio_buttons flex">
            <label className="flex justify-start mx-2">
              <input type="checkbox" className="checkbox checkbox-success" name="everyone" checked={visibility.everyone} onChange={handleVisibilityChange} />
              <span className="label-text mx-1 text-gray-700 "><i className="fa fa-users"></i> Everyone</span>
            </label>
            <label className="flex justify-start mx-2">
              <input type="checkbox" className="checkbox checkbox-success" name="staff" checked={visibility.staff} onChange={handleVisibilityChange} />
              <span className="label-text mx-1 text-gray-700 "><i className="fa fa-briefcase"></i> Staff</span>
            </label>
            <label className="flex justify-start mx-2">
              <input type="checkbox" className="checkbox checkbox-success" name="faculty" checked={visibility.faculty} onChange={handleVisibilityChange} />
              <span className="label-text mx-1 text-gray-700 "><i className="fa fa-university"></i> Faculty</span>
            </label>
            <label className="flex justify-start mx-2">
              <input type="checkbox" className="checkbox checkbox-success" name="students" checked={visibility.students} onChange={handleVisibilityChange} />
              <span className="label-text mx-1 text-gray-700 "><i className="fa fa-graduation-cap"></i> Students</span>
            </label>
          </div>
        </div>
      );
    }
    // If admin type is not 'School Owner', return null to render nothing
    return null;
  };


  return (
    <div className='flex flex-row my-24'>
      <div className="main_container p-3 m-3 w-full h-full  shadow-md rounded-3 bg-white border ">
      <div role="tablist" className="tabs tabs-lifted">
        <input type="radio" name="my_tabs_2" role="tab" className="tab text-green-600" aria-label="Announcements" />
        <div role="tabpanel" className="tab-content bg-green-600 shadow-lg rounded-md p-6">
          <div className="annoucement_creation_container bg-white p-4 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full shadow-md rounded-2 border">
          <h2 className='border-b border-gray-500 py-2 font-bold'>Create Announcement</h2>
                <div>
                  <label className="label text-gray-700" htmlFor="header">Header:</label>
                  <input
                    className="input input-bordered input-success input-md w-full text-gray-700 bg-white rounded-md shadow-xl"
                    type="text"
                    id="header"
                    value={header}
                    onChange={handleHeaderChange}
                  />
                </div>
                <div>
                  <label className="label text-gray-700" htmlFor="body">Body:</label>
                  <textarea
                    className="textarea textarea-success w-full text-gray-700 bg-white rounded-md shadow-xl"
                    id="body"
                    value={body}
                    onChange={handleBodyChange}
                  />
                </div>
                <div className="file-field flex justify-start">
                  <div className="div">
                  <label className="label flex justify-center items-center text-gray-700" htmlFor="media">Media:</label>
                  </div>
                  <input
                    className="file-input file-input-bordered file-input-success file-input-sm w-full max-w-xs mx-5 bg-white rounded-md shadow-xl"
                    type="file"
                    id="media"
                    accept="image/*, video/*, audio/*"
                    onChange={handleMediaChange}
                  />
                  {mediaPreview && (
                    <>
                      {media.type.startsWith('image/') && (
                        <img src={mediaPreview} alt="Media Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                      )}
                      {media.type.startsWith('video/') && (
                        <video controls style={{ maxWidth: '350px', maxHeight: '350px' }}>
                          <source src={mediaPreview} type={media.type} />
                        </video>
                      )}
                      {media.type.startsWith('audio/') && (
                        <audio controls style={{ maxWidth: '200px' }}>
                          <source src={mediaPreview} type={media.type} />
                        </audio>
                      )}
                    </>
                  )}
                </div>

                {renderVisibilityOptions()}
                
                <div className='flex justify-start my-2'>
                    <label className="label text-gray-700" htmlFor="postingDate">Posting Date:</label>
                    <input
                      className="input input-success input-md text-white mx-4 shadow-md "
                      type="datetime-local"
                      id="postingDate"
                      value={postingDate}
                      onChange={handlePostingDateChange}
                    />
                  </div>
                  <div className='flex justify-start'>
                    <label className="label text-gray-700" htmlFor="expirationDate">Expiration Date:</label>
                    <input
                      className="input input-success input-md text-white mx-1 shadow-md "
                      type="datetime-local"
                      id="expirationDate"
                      value={expirationDate}
                      onChange={handleExpirationDateChange}
                    />
                  </div>

                  <div className='flex my-3'>
                    <label htmlFor="community" className="block text-gray-700 text-left">Select Community:</label>
                    <select
                      id="community"
                      value={selectedCommunity}
                      onChange={handleCommunityChange}
                      className="flex flex-row w-full mt-1 mx-3 py-2 px-3 border border-green-300 bg-white rounded-md shadow-md   "
                    >
                      <option value="">Select a community</option>
                      {userCommunities.map((community) => (
                        <option key={community._id} value={community._id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  

                <div className="post_button flex justify-end">
                <button className="btn btn-success px-16 my-4 size text-base " onClick={handleSubmit}>Post</button>
                </div>

                <h3 className="border-t-2 border-gray-500 py-2 font-bold">Recent Posts</h3>

                <div className="recentpost_container overflow-auto max-h-96">
                
                  
                  <ul>
                    {approvedAnnouncements.slice(0, 3).map((announcement) => {
                      // Create a promise for fetching the community name
                      const communityNamePromise = announcement.communityId ? getCommunityName(announcement.communityId) : Promise.resolve(null);
                      
                      // Render each announcement with its community name when available
                      return (
                        <div key={announcement._id} className='card lg:card-side bg-white-100 shadow-xl p-3 m-5 transition-transform duration-300 ease-in-out transform hover:scale-110'>
                          <div className=" mx-2 ">
                            <h4 className='card-title p-2 bg-gray-300 w-full h rounded-md'> {announcement.header}</h4>
                            <div className="body_container  p-2 bg-gray-300 w-full h-32 rounded-md text-left overflow-auto max-h-full">
                            <p className=''> {announcement.body}</p>
                            </div>
                            <div className="community_container  p-2 bg-gray-300 w-full my-2 rounded-md">
                            <PromiseRenderer promise={communityNamePromise}  />
                            </div>
                          </div>
                         
                          {announcement.mediaUrl ? (
                            <div>
                              
                              <div className=" flex justify-center items-center">
                              
                              {announcement.contentType && announcement.contentType.startsWith('image') ? (
                                <img src={announcement.mediaUrl} alt="Announcement Media" className= 'w-full' /> 
                              ) : announcement.contentType && announcement.contentType.startsWith('video') ? (
                              <figure> <video controls>
                                  <source src={announcement.mediaUrl} type={announcement.contentType} />
                                </video>
                                </figure> 
                              ) : announcement.contentType && announcement.contentType.startsWith('audio') ?
                               (
                                <audio controls>
                                  <source src={announcement.mediaUrl} type={announcement.contentType} />
                                </audio>
                                
                               ):(
                                <p>No media available</p>
                              )}
                              </div>
                            </div>
                          ) : (
                            <p>No media available</p>
                          )}
                        </div>
                      );
                    })}
                  </ul>
                </div>
          </div>
        </div>
                    

        <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Events"  />
        <div role="tabpanel" className="tab-content bg-green-100 border-base-300 rounded-box p-6"><CreateEvent/></div>

        {adminType2 === 'School Owner' && (
  <>
    <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Post Approval" />
    <div role="tabpanel" className="tab-content bg-green-100 border-base-300 rounded-box p-6">
      <PostApproval />
    </div>
  </>
)}
      </div>

      </div>

      <div className="community_calendar_container p-3 m-3 w-max h-full  shadow-md rounded-3 bg-white border">

        <h2>Community Calendar</h2>
        

      </div>
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