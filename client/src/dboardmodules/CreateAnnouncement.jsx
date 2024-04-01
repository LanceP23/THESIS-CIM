import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Import toast from react-hot-toast
import './CreateAnnouncement.css'
import Sidebar from '../components/Sidebar';
import {Container, Row, Tabs, Tab} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'


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
    <div>
     <Sidebar/>

     <div className='Announcement_container'>


      <div className='tab_container'> 
      
      <Container className='py-4 custom-tabs'>
        <Row className='justify-content-start'>
          <Tabs justify variant='tabs' defaultActiveKey='tab-1' className='mb-1 p-0 custom-tabs'>
            
            <Tab eventKey='tab-1' title=' Announcement' >

              <div className='create_annoucement'>
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
                      
                      <button className="button" onClick={handleSubmit}>Post</button>
                    </div>
                    

              </div>

              <div className='recent_post_container'>
                <h3>Recent Posts</h3>
              </div>
                    

            </Tab>
            
            <Tab eventKey='tab-2' title='Event'>
              Event

            </Tab>

           
          </Tabs>
        </Row>

      </Container>

<<<<<<< Updated upstream
=======
                <div className='recent_post_container'>
                  <h3>Recent Posts</h3>
                  
                  <div className="container_1">
                  <ul>
<<<<<<< Updated upstream
                  {approvedAnnouncements.slice(0, 3).map((announcement) => {
                      return (
                        <li key={announcement._id}>
                          <h4>{announcement.header}</h4>
                          <p>{announcement.body}</p>
                          {announcement.media && announcement.media.data ? (
                            <div className="container_2">
=======
                      {approvedAnnouncements.slice(0, 3).map((announcement) => (
                        <div key={announcement._id} className="announcement">
                          <h4> Header: {announcement.header}</h4>
                          <p> Body: {announcement.body}</p>
                          {announcement.media && announcement.media.path ? (
                            <div className='retrieved_image'>
>>>>>>> Stashed changes
                              <p>Media:</p>
                              {announcement.media.contentType.startsWith('image') ? (
                                <img src={`data:${announcement.media.contentType};base64,${announcement.media.data}`} alt="Media" />
                              ) : (
                                <video controls>
                                  <source src={`data:${announcement.media.contentType};base64,${announcement.media.data}`} type={announcement.media.contentType} />
                                </video>
                              )}
                            </div>
                          ) : (
                            <p>No media available</p>
                          )}
<<<<<<< Updated upstream
                        </li>
                      );
                    })}
                  </ul>
                  </div>
                  
=======
                        </div>
                      ))}
                    </ul>

>>>>>>> Stashed changes
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
>>>>>>> Stashed changes

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
}
