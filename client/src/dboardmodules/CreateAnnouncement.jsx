import React, { useState, useEffect } from 'react';
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


  return (
    <div>
      <h2 className='_post_manag_title'>Post Management <FontAwesomeIcon icon={faBullhorn}/></h2>
      <Sidebar adminType={adminType2} />

      <div className='Announcement_container'>
        <div className='tab_container'>
          <Row className='justify-content-start row'>
            <Tabs justify variant='tabs' defaultActiveKey='tab-1' className='mb-1 p-0 custom-tabs'>
              <Tab eventKey='tab-1' title=' Announcement' className='tabs'>
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
                  {mediaPreview && (
                    <img src={mediaPreview} alt="Media Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  )}
                </div>
                <div className="visibility-options">
                  <label>Visibility:</label>
                  <label className="custom-option">
                    <input type="checkbox" name="everyone" checked={visibility.everyone} onChange={handleVisibilityChange} />
                    <span className="option-icon"><i className="fa fa-users"></i> Everyone</span>
                  </label>
                  <label className="custom-option">
                    <input type="checkbox" name="staff" checked={visibility.staff} onChange={handleVisibilityChange} />
                    <span className="option-icon"><i className="fa fa-briefcase"></i> Staff</span>
                  </label>
                  <label className="custom-option">
                    <input type="checkbox" name="faculty" checked={visibility.faculty} onChange={handleVisibilityChange} />
                    <span className="option-icon"><i className="fa fa-university"></i> Faculty</span>
                  </label>
                  <label className="custom-option">
                    <input type="checkbox" name="students" checked={visibility.students} onChange={handleVisibilityChange} />
                    <span className="option-icon"><i className="fa fa-graduation-cap"></i> Students</span>
                  </label>
                </div>
                <button className="button" onClick={handleSubmit}>Post</button>

                <div className='recent_post_container'>
                  <h3>Recent Posts</h3>
                  <ul>
                    {approvedAnnouncements.slice(0, 3).map((announcement) => {
                      return (
                        <div key={announcement._id} className='announcement'>
                          <div className="header_cont">
                          <h4> Header: {announcement.header}</h4>
                          <p> <strong>Body:</strong> {announcement.body}</p>
                          </div>
                         
                          {announcement.mediaUrl ? (
                            <div>
                              
                              <div className="media_cont">
                              <p>Media:</p>
                              {announcement.contentType && announcement.contentType.startsWith('image') ? (
                                <img src={announcement.mediaUrl} alt="Announcement Media" />
                              ) : announcement.contentType && announcement.contentType.startsWith('video') ? (
                                <video controls>
                                  <source src={announcement.mediaUrl} type={announcement.contentType} />
                                </video>
                              ) : (
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
              </Tab>
              <Tab eventKey='tab-2' title='Event' className='tabs'>
             
                  
              <CreateEvent />
              
              </Tab>
              {adminType2 === 'School Owner' && (
                <Tab eventKey='tab-3' title='Post Approval' className='tabs'>
                  <PostApproval />
                </Tab>
              )}
            </Tabs>
          </Row>
        </div>
        

        {/*<div className='community_calendar_container'>
          <div className='calendar_container'>
            <h3>Community Calendar</h3>
          </div>
          <div className='bottom_part'></div>
            </div>*/}
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