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
import { faBullhorn, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../context/userContext';
import Eventcalendar from '../dboardmodules/MyCommunityModule/Eventcalendar'
import { Calendar } from '@fullcalendar/core';
import listPlugin from '@fullcalendar/list';
import ManageUserAnnouncement from './ManageUserAnnouncement';
import { FaReact } from 'react-icons/fa';


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
  const [isOrganizationPost, setIsOrganizationPost] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);
  const [selectedMinigame, setSelectedMinigame] = useState('');
  const [minigameWord, setMinigameWord] = useState('');

  const adminType2 = localStorage.getItem('adminType');

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

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  useEffect(() => {
    // Check if adminType is Organization Officer
    if (adminType === 'Organization Officer') {
        const fetchOrganizationId = async () => {
            try {
                const token = getToken();
                const userId = user?.id;

                if (!token || !userId) {
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                };
                const response = await axios.get(`/organization-id/${userId}`, config); // Pass the userId as a parameter
                if (response.data.organizationId) {
                    setOrganizationId(response.data.organizationId);
                }
            } catch (error) {
                console.error('Error fetching organization ID:', error);
                toast.error('Failed to fetch organization ID');
            }
        };

        // Call fetchOrganizationId only if adminType is Organization Officer
        fetchOrganizationId();
    }
}, [user, adminType]);

  


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

  const handleMinigameChange = (e) => {
    setSelectedMinigame(e.target.value);
  };
  
  const handleMinigameWordChange = (e) => {
    setMinigameWord(e.target.value);
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }
  
    try {
      setSubmitting(true);
      toast.loading('Uploading...');
      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      if (!token) {
        throw new Error('No token found');
      }
  
      // Create form data with announcement details
      const formData = new FormData();
      formData.append('header', header);
      formData.append('body', body);
      formData.append('visibility', JSON.stringify(visibility));
      formData.append('postingDate', postingDate);
      formData.append('expirationDate', expirationDate);
      formData.append('communityId', selectedCommunity);
  
      // Append the minigame and minigameWord if they are selected
      if (selectedMinigame) {
        formData.append('minigame', selectedMinigame);
      }
      if (minigameWord) {
        formData.append('minigameWord', minigameWord);
      }
  
      if (isOrganizationPost && organizationId) {
        formData.append('organizationId', organizationId);
      }
  
      // Handle media upload
      if (media) {
        const storageRef = ref(storage, media.name);
        const uploadTask = uploadBytesResumable(storageRef, media);
  
        uploadTask.on('state_changed',
          (snapshot) => {
            // Handle upload progress if needed
          },
          (error) => {
            toast.dismiss();
            throw new Error('Error uploading media:', error);
          },
          async () => {
            // Handle successful upload
            try {
              const mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
              formData.append('mediaUrl', mediaUrl); // Always append mediaUrl
  
              const response = await axios.post('/announcements', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${token.split('=')[1]}`,
                },
              });
  
              resetFormFields();
              showSuccessMessage(adminType2);
            } catch (error) {
              toast.error('Error creating announcement');
              console.error('Error creating announcement:', error);
            } finally {
              setSubmitting(false);
            }
          }
        );
      } else {
        // If no media is uploaded, handle the submission without media
        try {
          const response = await axios.post('/announcements', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token.split('=')[1]}`,
            },
          });
  
          resetFormFields();
          showSuccessMessage(adminType2);
        } catch (error) {
          toast.error('Error creating announcement');
          console.error('Error creating announcement:', error);
        } finally {
          setSubmitting(false);
        }
      }
    } catch (error) {
      toast.error('Error creating announcement');
      console.error('Error creating announcement:', error);
    }
  };
  
  // Function to reset form fields
  const resetFormFields = () => {
    setHeader('');
    setBody('');
    setMedia(null);
    setMediaPreview(null);
    setVisibility('');
    setPostingDate('');
    setExpirationDate('');
    setSelectedCommunity('');
    setSelectedMinigame(''); 
    setMinigameWord('');
  };
  
  // Function to show success message based on admin type
  const showSuccessMessage = (adminType) => {
    if (adminType !== 'School Owner') {
      toast.success('Your post is pending approval');
    } else {
      toast.success('Announcement created successfully');
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

  const handleOrganizationPostChange = (e) => {
    setIsOrganizationPost(e.target.checked);
  };

  const renderVisibilityOptions = () => {
    // Check if the admin type is 'School Owner'
    if (adminType === 'School Owner') {
      return (
        <div className="flex flex-col my-3">
          <div className="label my-0 py-0">
            <label className="label text-gray-700" htmlFor="body">Visibility:</label>
          </div>
          <div className="radio_buttons flex flex-wrap">
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
    <div className=' p-4 animate-fade-in '>
      <div className="p-3 pr-5 mt-20 w-full h-full shadow-md rounded-3 bg-white border ">
      <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2 mb-3'>  <FontAwesomeIcon icon={faBullhorn} className=' text-yellow-500 mx-1 '/>Post Management</h2>
      <div role="tablist" className="tabs tabs-lifted w-full z-0">
        <input type="radio" name="my_tabs_2" role="tab" className="tab text-green-600 " aria-label="Create Announcement" />
        <div role="tabpanel" className="tab-content bg-green-100 shadow-lg rounded-md p-2  ">
          <div className="  annoucement_creation_container  p-2 w-full h-full  animate-fade-in ">
          <h2 className='border-b border-gray-500 py-2 font-bold '>Create Announcement</h2>
         <div className="flex flex-col  justify-around w-full ">
          <div className="flex flex-col">
          
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
                
                <div className='flex flex-wrap justify-start my-2'>
                    <label className="label text-gray-700" htmlFor="postingDate">Posting Date:</label>
                    <input
                      className="input input-success input-md text-white ml-2 sm:ml-2 md:ml-6 lg:ml-6 xl:ml-6 mr-1 shadow-md "
                      type="datetime-local"
                      id="postingDate"
                      value={postingDate}
                      onChange={handlePostingDateChange}
                    />
                    <label className="label text-red-500 opacity-50 text-xs " htmlFor="expirationDate">*Not Required</label>
                  </div>
                  <div className='flex flex-wrap justify-start'>
                    <label className="label text-gray-700" htmlFor="expirationDate">Expiration Date:</label>
                    <input
                      className="input input-success input-md text-white mx-1 shadow-md "
                      type="datetime-local"
                      id="expirationDate"
                      value={expirationDate}
                      onChange={handleExpirationDateChange}
                    />
                     <label className="label text-red-500 opacity-50 text-xs " htmlFor="expirationDate">*Required</label>
                  </div>
                
                  {adminType === 'Organization Officer' && (
                    <label className="flex justify-start mx-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-success"
                        id="organizationPost"
                        checked={isOrganizationPost}
                        onChange={handleOrganizationPostChange}
                      />
                      <span className="label-text mx-1 text-gray-700">
                        Post to Organization Only
                      </span>
                    </label>
                  )}

                {adminType === 'School Owner'&& (
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
                )}

              <div className="flex my-3">
                    <label className="label text-gray-700">Select Minigame:</label>
                    <select
                      value={selectedMinigame}
                      onChange={handleMinigameChange}
                      className="flex flex-row w-full mt-1 mx-3 py-2 px-3 border border-green-300 bg-white rounded-md shadow-md  "
                    >
                      <option value="">Select a minigame</option>
                      <option value="CIM Wordle">CIM Wordle</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>
                  {selectedMinigame === 'CIM Wordle' && (
                    <div className="flex my-3">
                      <label className="label text-gray-700" htmlFor="minigameWord">Enter 5-Letter Word:</label>
                      <input
                        className="input input-bordered input-success input-md w-full text-gray-700 bg-white rounded-md shadow-xl"
                        type="text"
                        id="minigameWord"
                        value={minigameWord}
                        onChange={handleMinigameWordChange}
                        maxLength={5}
                      />
                    </div>
                  )}
                  

                <div className="post_button flex justify-end">
                <button className="btn btn-success px-16 my-4 size text-base " onClick={handleSubmit}>Post</button>
                </div>

                </div>
                <div className="divider divider-horizontal divider-warning my-2"></div>

                <div className="div ">

                <h3 className="  font-bold mt-3 text-left">Recent Posts</h3>

                <div className="divider divider-warning"></div>

                <div className=" overflow-auto max-h-[100vh] w-full">
                <ul>
        {approvedAnnouncements.slice(0, 3).map((announcement) => {
          const communityNamePromise = announcement.communityId
            ? getCommunityName(announcement.communityId)
            : Promise.resolve(null);

          return (
            <div
              key={announcement._id}
              className="card bg-slate-200 shadow-2xl p-0 m-5 transition-transform duration-300 ease-in-out transform hover:scale-105 sm:card md:card-side lg:card-side xl:card-side"
            >
              {announcement.mediaUrl ? (
                <div className="p-0">
                  {announcement.contentType && announcement.contentType.startsWith("image") ? (
                    <img
                      src={announcement.mediaUrl}
                      alt="Announcement Media"
                      className=" w-[50vw] max-h-[55vh] object-cover cursor-pointer"
                      onClick={() => openModal(announcement.mediaUrl)}
                    />
                  ) : announcement.contentType && announcement.contentType.startsWith("video") ? (
                    <figure>
                      <video controls className="max-w-xl h-full">
                        <source src={announcement.mediaUrl} type={announcement.contentType} />
                      </video>
                    </figure>
                  ) : announcement.contentType && announcement.contentType.startsWith("audio") ? (
                    <audio controls className="max-w-xl h-full">
                      <source src={announcement.mediaUrl} type={announcement.contentType} />
                    </audio>
                  ) : (
                    <p className="flex justify-center items-center border-2 border-white max-w-xl h-full">
                      No media available
                    </p>
                  )}
                </div>
              ) : (
                <p className="flex justify-center items-center border-2 border-white">No media available</p>
              )}

              <div className="w-full flex flex-col ">
                <div className="card-body">
                  <h4 className="card-title w-full border-b border-yellow-400 text-green-800">
                    {announcement.header}
                  </h4>
                  <div className="body_container p-2 w-full h-32 rounded-md text-left overflow-auto max-h-full border-2">
                    <p>{announcement.body}</p>
                  </div>
                  <div className="community_container p-2 w-full my-2 rounded-md border-2 text-left">
                    <PromiseRenderer promise={communityNamePromise} />
                  </div>
                </div>

                <div className="grid grid-cols-2 shadow-inner ">
                  <div className="max-w-[50vw] p-3 shadow-inner">
                    <FontAwesomeIcon className="text-green-500 text-2xl" icon={faThumbsUp} />
                    <label className="mx-2">{announcement.likes} Likes </label>
                  </div>
                  <div className="max-w-[50vw] p-3 shadow-inner">
                    <FontAwesomeIcon className="text-red-500 text-2xl" icon={faThumbsDown} />
                    <label className="mx-2">{announcement.dislikes} Dislikes </label>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </ul>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative  rounded-lg shadow-lg w-[60vw] max-h-[80vh]  ">
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
          </div>
          </div>
          </div>
        </div>
        <input type="radio" name="my_tabs_2" role="tab" className="tab text-green-600 w-auto " aria-label="Edit Posts" />
        <div role="tabpanel" className="tab-content bg-green-100 border-base-300 rounded-box p-6 ">
          <ManageUserAnnouncement/>
          </div>
                    

       
        {adminType2 === 'School Owner' && (
  <>
    <input type="radio" name="my_tabs_2" role="tab" className="tab text-green-600  " aria-label="Post Approval" />
    <div role="tabpanel" className="tab-content bg-green-100 border-base-300 rounded-box p-6 ">
      <PostApproval />
    </div>
  </>
)}
      </div>

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