import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import PostApproval from '../dboardmodules/ManagePostSubModules/PostApproval';
import './CreateAnnouncement.css';
import { Container, Row, Tabs, Tab } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

export default function CreateAnnouncement() {
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState(null);
  const [showPostApprovalModal, setShowPostApprovalModal] = useState(false); // modal visibility
  const [adminType, setAdminType] = useState('');
  const [approvedAnnouncements, setApprovedAnnouncements] = useState([]);
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
  };

  const handleSubmit = async () => {
    // Your submit logic
  };

  const toggleModal = () => {
    setShowPostApprovalModal(!showPostApprovalModal);
  };

  return (
    <div>
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
                </div>
                <button className="button" onClick={handleSubmit}>Post</button>

                <div className='recent_post_container'>
                  <h3>Recent Posts</h3>
                  <ul>
                    {approvedAnnouncements.slice(0, 3).map((announcement) => (
                      <li key={announcement._id}>
                        <h4>{announcement.header}</h4>
                        <p>{announcement.body}</p>
                        {announcement.media && (
                          <div>
                            <p>Media:</p>
                            {announcement.media.contentType.startsWith('image') ? (
                              <img src={`data:${announcement.media.contentType};base64,${announcement.media.data.toString('base64')}`} alt="Media" />
                            ) : (
                              <video controls>
                                <source src={`data:${announcement.media.contentType};base64,${announcement.media.data.toString('base64')}`} type={announcement.media.contentType} />
                              </video>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Tab>
              <Tab eventKey='tab-2' title='Event' className='tabs'>
                Event
              </Tab>
              {adminType2 === 'School Owner' && (
                <Tab eventKey='tab-3' title='Post Approval' className='tabs'>
                  <PostApproval />
                </Tab>
              )}
            </Tabs>
          </Row>
        </div>

        <div className='community_calendar_container'>
          <div className='calendar_container'>
            <h3>Community Calendar</h3>
          </div>
          <div className='bottom_part'></div>
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
