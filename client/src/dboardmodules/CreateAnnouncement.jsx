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
<<<<<<< Updated upstream
    <div>
     <Sidebar/>
=======
    <div className='flex flex-row mt-16  animate-fade-in '>
      <div className="p-3 ml-14 mt-8 mr-14  w-full shadow-md rounded-3 bg-white border  ">
      <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2 mb-3'>  <FontAwesomeIcon icon={faBullhorn} className=' text-yellow-500 mx-1 '/>Post Management</h2>
      <div role="tablist" className="tabs tabs-lifted w-full">
        <input type="radio" name="my_tabs_2" role="tab" className="tab text-green-600 w-full " aria-label="Create Announcement" />
        <div role="tabpanel" className="tab-content bg-green-100 shadow-lg rounded-md p-6 w-full">
          <div className=" shadow-inner annoucement_creation_container bg-white p-4 my-2  w-full  h-full  rounded-2 border animate-fade-in ">
          <h2 className='border-b border-gray-500 py-2 font-bold '>Create Announcement</h2>
         <div className="flex flex-col justify-around">
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
>>>>>>> Stashed changes

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
                    

<<<<<<< Updated upstream
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
=======
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
                  

                <div className="post_button flex justify-end">
                <button className="btn btn-success px-16 my-4 size text-base " onClick={handleSubmit}>Post</button>
                </div>

                </div>
                <div className="divider divider-horizontal divider-warning my-2"></div>

                <div className="div ">

                  {/*dito lalagay yung recent post*/}

                  <h3 className=" border-gray-500 font-bold mt-3 text-left">Recent Posts</h3>
                  {/*dito lalagay yung recent post*/}

                <div className="divider divider-warning"></div>

                <div className="recentpost_container overflow-auto max-h-[650px]">
                
>>>>>>> Stashed changes
                  
                  <div className="container_1">
                  <ul>
<<<<<<< Updated upstream
                  {approvedAnnouncements.slice(0, 3).map((announcement) => {
                      return (
<<<<<<< Updated upstream
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
      
      
=======
                        <div key={announcement._id} className='card md:card-side lg:card-side xl:card-side bg-slate-200 shadow-2xl p-0 m-5 transition-transform duration-300 ease-in-out transform hover:scale-105 '>

                        {announcement.mediaUrl ? (
                          
                              
                          <div className=" p-0">
                          
                          {announcement.contentType && announcement.contentType.startsWith('image') ? (
                           

                            
                            <img src={announcement.mediaUrl} alt="Announcement Media" className= ' max-w-xl h-full shrink-0' /> 
                           
                          ) : announcement.contentType && announcement.contentType.startsWith('video') ? (
                          <figure> <video controls className='max-w-xl h-full'>
                              <source src={announcement.mediaUrl} type={announcement.contentType} />
                            </video>
                            </figure> 
                          ) : announcement.contentType && announcement.contentType.startsWith('audio') ?
                           (
                            <audio controls className='max-w-xl h-full'>
                              <source src={announcement.mediaUrl} type={announcement.contentType} />
                            </audio>
                            
                           ):(
                            <p className='flex justify-center items-center border-2 border-white max-w-xl h-full'>No media available</p>
                          )}
                          </div>
                       
                      ) : (
                      
                        <p className='flex justify-center items-center border-2 border-white '>No media available</p>
                        
                      )}
                          <div className=" card-body">
                            <h4 className='card-title w-full border-b border-yellow-400 text-green-700'> {announcement.header}</h4>
                            <div className="body_container p-2  w-full h-32 rounded-md text-left overflow-auto max-h-full border-2 text-gray-700">
                            <p className=''> {announcement.body}</p>
                            </div>
                            <div className="community_container  p-2  w-full my-2 rounded-md border-2 text-left">
                            <PromiseRenderer promise={communityNamePromise}  />
                            </div>
                          </div>
                         
                          
                        </div>
                      );
                    })}
                  </ul>
                </div>

                
          </div>
          </div>
          </div>
        </div>
        <input type="radio" name="my_tabs_2" role="tab" className="tab text-green-600 w-full " aria-label="Edit Posts" />
        <div role="tabpanel" className="tab-content bg-green-100 border-base-300 rounded-box p-6">
          <ManageUserAnnouncement/>
          </div>
                    
>>>>>>> Stashed changes

      </div>

      </div>

      

     </div>

    
    </div>
  );
}
