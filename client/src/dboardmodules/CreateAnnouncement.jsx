import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import PostApproval from '../dboardmodules/ManagePostSubModules/PostApproval';
import './CreateAnnouncement.css'
import {Container, Row, Tabs, Tab} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

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
              </div>
                    
             

  
           </Tab>
           
           <Tab eventKey='tab-2' title='Event'className='tabs'>
             Event

           </Tab>

           <Tab eventKey='tab-3' title='Post Approval' className='tabs'>
             <PostApproval/>

           </Tab>


          
         </Tabs>
       </Row>

     


     </div>

     <div className='community_calendar_container'>

    

     <div className='calendar_container'>
       <h3>Community Calendar</h3>

     </div>

     <div className='bottom_part'>
     
     

     </div>

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
