import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import Modal from 'react-modal';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './CreateEvent.css';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000, 
  },
  content: {
    
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '100vh',
    maxWidth: '100vh',
    padding: '20px',
    textAlign: 'center',
    zIndex: 1001, 
    maxHeight: '100vh', // Maximum height for modal content
    
    
    
  },
};


const CreateEvent = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [events, setEvents] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminType, setAdminType] = useState('');
  const [eventType, setEventType] = useState('');
  const [organizerType, setOrganizerType] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [participantType, setParticipantType] = useState('individual');
  const [participants, setParticipants] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [participantOrganizations, setParticipantOrganizations] = useState([]);
  const [selectedParticipantOrganizations, setSelectedParticipantOrganizations] = useState([]);
  const [committee, setCommittee] = useState('');
  const [committeeChairman, setCommitteeChairman] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);


  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/check-auth');
        if (!response.data.authenticated) {
          navigate('/login');
        } else {
          setAuthenticated(true);
          setAdminType(localStorage.getItem('adminType'));
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/fetch-event');
        const formattedEvents = response.data.map(event => {
          return {
            title: `${moment(event.start).format('h:mma')} - ${event.title}`,
            start: event.start,
            end: event.end,
            eventType: event.eventType,
            organizerType: event.organizerType,
            organizerName: event.organizerName,
            participants: event.participant, // Update participants field
            committee: event.committee,
            committeeChairman: event.committeeChairman,
            location: event.location,
            budget: event.budget,
            ...event, 
          };
        });
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    
  
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/organization');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreate = async () => {
    try {
      setSubmitting(true);
      toast.loading('Creating Event...');
      const token = getToken();
      let participantsToSend = [];
    
      // Include participants based on their type
      if (participantType === 'individual' || participantType === 'group') {
        participantsToSend = participants.map(participant => ({
          name: participant.name,
          section: participant.section,
          type: participantType,
          ...(participantType === 'individual' ? {} : { members: participant.members })
        }));
      } 
       if (eventType === 'organizational') {
        // Add individual participants
        participantsToSend = participants.map(participant => ({
          name: participant.name,
          section: participant.section,
          type: participantType,
          ...(participantType === 'individual' ? {} : { members: participant.members })
        }));
      
        // Add selected organizations
        selectedParticipantOrganizations.forEach(org => {
          participantsToSend.push({
            id: org.id,
            name: org.name,
            type: 'organizational'
          });
        });
      }
      const response = await axios.post(
        '/events',
        {
          title: eventName,
          start: `${selectedDate.start}T${startTime}`,
          end: `${endDate}T${endTime}`,
          eventType: eventType,
          organizerType: organizerType,
          organizerName: organizerName,
          participants: participantsToSend, 
          committee: committee,
          committeeChairman: committeeChairman,
          location: location,
          budget: budget,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success('Event Creation Successful!')
      setModalIsOpen(false);
      setEventName('');
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setEventType('');
      setParticipantType('individual');
      setParticipants([]);
      setParticipantOrganizations([]);
      setSelectedParticipantOrganizations([]);
      setCommittee('');
      setCommitteeChairman('');
      setLocation('');
      setBudget('');
      setOrganizerType('');
      setOrganizerName('');
    } catch (error) {
      toast.dismiss();
      console.error('Error creating event:', error);
      toast.error('Event Creation Failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event); 
    setModalMode('details');
    setModalIsOpen(true); 
  };
  const handleDoubleClick = (org) => {
    // Check if the organization object is already in selectedParticipantOrganizations
    if (!selectedParticipantOrganizations.some(selectedOrg => selectedOrg.id === org.id)) {
      setSelectedParticipantOrganizations([...selectedParticipantOrganizations, org]);
  
      // Add the organization's name to the participants array
      const organizationName = org.name;
      setParticipants([...participants, organizationName]);
    } else {
      toast.error('Organization already selected');
    }
  };
  
  
  const handleRemoveParticipant = (orgToRemove) => {
    setSelectedParticipantOrganizations(selectedParticipantOrganizations.filter(org => org !== orgToRemove));
  };

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  const closeModal = () => {
  setModalIsOpen(false);
  resetModalState();
};
const resetModalState = () => {
  setEventName('');
  setStartDate('');
  setStartTime('');
  setEndDate('');
  setEndTime('');
  setEventType('');
  setParticipantType('individual');
  setParticipants([]);
  setParticipantOrganizations([]);
  setSelectedParticipantOrganizations([]);
  setCommittee('');
  setCommitteeChairman('');
  setLocation('');
  setBudget('');
  setOrganizerType('');
  setOrganizerName('');
};

  const handleParticipantChange = (index, key, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][key] = value;
    setParticipants(updatedParticipants);
  };

  const handleMemberChange = (index, memberIndex, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].members[memberIndex] = value;
    setParticipants(updatedParticipants);
  };

  const removeParticipant = (index) => {
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    setParticipants(updatedParticipants);
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: '', section: '', members: [] }]);
  };

  const addGroup = () => {
    setParticipants([...participants, { name: '', section: '', members: [] }]);
  };
  // Function to handle the date selection event
const handleDateSelect = (selectInfo) => {
  setSelectedDate({
    start: selectInfo.startStr,
    end: selectInfo.endStr,
  });
  // Open the modal when a date is selected
  setModalMode('add');

};


  return (
    <div>

      

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick} 
        selectable = {true}
        select={handleDateSelect}
        
      />
      

     <Modal
     isOpen={modalIsOpen || !!selectedDate} // Open the modal when a date is selected
     onRequestClose={() => {
       setModalIsOpen(false);
       setSelectedDate(null); // Reset the selected date state
       
     }}
     
     style={customStyles}
    >
    
    {/*modal for details*/}
     { modalMode === 'details' && selectedEvent ? (
    <div className='details_container'>
      
     
      <div className="first_col">
      <h2>Event Details</h2>
      <h3>Title:{selectedEvent.title}</h3>
      <h3>Start Date: {moment(selectedEvent.start).format('YYYY-MM-DD HH:mm:ss')}</h3>
      <h3>End Date: {moment(selectedEvent.end).format('YYYY-MM-DD HH:mm:ss')}</h3>
     
      </div>

      <div className="second_col">
      <p><strong>Event Type:</strong> {selectedEvent.extendedProps.eventType}</p>
      <p> <strong>Organizer Type:</strong> {selectedEvent.extendedProps.organizerType}</p>
      <p><strong>Organizer Name:</strong> {selectedEvent.extendedProps.organizerName}</p>
      <p><strong>Committee: </strong>{selectedEvent.extendedProps.committee}</p>
      <p> <strong>Committee Chairman:</strong> {selectedEvent.extendedProps.committeeChairman}</p>
      <p><strong>Location:  </strong>{selectedEvent.extendedProps.location}</p>
      <p> <strong>Budget:</strong>{selectedEvent.extendedProps.budget}</p>
      
      {selectedEvent && selectedEvent.extendedProps && selectedEvent.extendedProps.participants && (
      <p> <strong>Participants:</strong> {JSON.stringify(selectedEvent.extendedProps.participants)}</p>
      )}
      </div>
         
      <button onClick={closeModal} className='create_close_button'>Close</button>
   
    </div>
    

     ) : (
       <>
         <h2>Create Event on :  {selectedDate && ( 
          <h2 value={startDate} onChange={(e) => setStartDate(e.target.value)}> Start Date: <strong>{selectedDate.start} </strong>   </h2>
           )}</h2>
         <div className='create_event_container'>

          <div className="first_column">
           <div className='event_content_1'>
          
           <label>
              <strong>End Date:</strong>
            </label>
              <input type="date" value={endDate}  onChange={(e) => {
                const inputtedEndDate = e.target.value;
                if (inputtedEndDate < selectedDate.start) {
                  alert('End date cannot be before the start date');
                  return; 
                }
                setEndDate(inputtedEndDate);
                }}
                className='date_field'
              />
            
            </div>
            <div className='event_content_3'>
            <label>
              <strong>Start Time:</strong> 
            </label>
              <input type="time"  value={startTime} onChange={(e) => setStartTime(e.target.value)}  className='date_field'  />
           
           
            <label>
              <strong>End Time: </strong>
            </label>
              <input type="time"  value={endTime} onChange={(e) => setEndTime(e.target.value)}  className='date_field' />
            
          </div>
          <div className='event_content_2'>
            <label>
              <strong>Event Name:</strong>
              <input type="text" className='input__field' value={eventName} onChange={(e) => setEventName(e.target.value)} />
            </label>
          </div>
          
          <div className='event_content_11'>
            <label>
              <strong>Location:</strong>
              <input type="text" className='input__field' value={location} onChange={(e) => setLocation(e.target.value)} />
            </label>
          </div>

          <div className='event_content_9'>
            <label>
              <strong>Committee:</strong>
              <input type="text" className='input__field' value={committee} onChange={(e) => setCommittee(e.target.value)} />
            </label>
          </div>
          <div className='event_content_10'>
            <label>
              <strong>Committee Chairman:</strong>
              <input type="text" className='input__field' value={committeeChairman} onChange={(e) => setCommitteeChairman(e.target.value)} />
            </label>
          </div>
          
          <div className='event_content_12'>
            <label>
              <strong>Budget:</strong>
              <input type="text" className='input__field' value={budget} onChange={(e) => setBudget(e.target.value)} />
            </label>
          </div>

          </div>

          <div className="second_column">
          <div className="second_column_container">
          <div className='event_content_4'>
            <label>
              <strong>Event Type:</strong>
              <select value={eventType} className='input__field' onChange={(e) => setEventType(e.target.value)}>
                <option value="">Select Event Type</option>
                <option value="institutional">Institutional</option>
                <option value="organizational">Organizational</option>
                <option value="structural">Structural</option>
                <option value="specialized">Specialized</option>
              </select>
            </label>
          </div>
          {["institutional", "structural", "specialized"].includes(eventType) && (
            <div className='event_content_5'>
              <label>
                <strong>Participant Type:</strong>
                <select value={participantType} className='input__field' onChange={(e) => setParticipantType(e.target.value)}>
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </label>
              {participantType === 'individual' && (
                <div className='event_content_6'>
                  {participants.map((participant, index) => (
                    <div key={index}>
                      <label>
                        <strong>Participant Name:</strong>
                        <input type="text" value={participant.name} className='input__field' onChange={(e) => handleParticipantChange(index, 'name', e.target.value)} />
                      </label>
                      <label>
                        <strong>Section:</strong>
                        <input type="text" value={participant.section} className='input__field' onChange={(e) => handleParticipantChange(index, 'section', e.target.value)} />
                      </label>
                      <button onClick={() => removeParticipant(index)} className='add_remove_button'>Remove Participant</button>
                    </div>
                  ))}
                  <button onClick={addParticipant} className='add_remove_button'>Add Participant</button>
                </div>
              )}
              {participantType === 'group' && (
                <div className='event_content_7'>
                  {participants.map((participant, index) => (
                    <div key={index}>
                      <label>
                        <strong>Group Name:</strong>
                        <input type="text" value={participant.name} className='input__field' onChange={(e) => handleParticipantChange(index, 'name', e.target.value)} />
                      </label>
                      <label>
                        <strong>Section:</strong>
                        <input type="text" value={participant.section} className='input__field' onChange={(e) => handleParticipantChange(index, 'section', e.target.value)} />
                      </label>
                      <div>
                        <strong>Members:</strong>
                        {participant.members.map((member, memberIndex) => (
                          <input key={memberIndex} type="text" className='input__field' value={member} onChange={(e) => handleMemberChange(index, memberIndex, e.target.value)} />
                        ))}
                        <button onClick={() => handleParticipantChange(index, 'members', [...participant.members, ''])}>Add Member</button>
                      </div>
                      <button onClick={() => handleRemoveParticipant(index)} className='add_remove_button'>Remove Participant</button>
                    </div>
                  ))}
                  <button onClick={addGroup} className='add_remove_button'>Add Group</button>
                </div>
              )}
            </div>
          )}
          
          {eventType === 'organizational' && (
            <div className='event_content_8'>
              <label>
                <strong>Participant Organizations:</strong>
                <select multiple value={participantOrganizations} className='input__field'  onChange={(e) => {const selectedOptions = Array.from(e.target.selectedOptions, option => option.value); setParticipantOrganizations(selectedOptions);}}>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id} onDoubleClick={() => handleDoubleClick(org)}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={() => setSelectedParticipantOrganizations([...selectedParticipantOrganizations, ...participantOrganizations])}>Add Participant Organizations</button>
            </div>
          )}
          <div className="selected-participants">
            <strong>Selected Participants:</strong>
            {selectedParticipantOrganizations.map(org => (
              <div key={org.id}>
                <span>{org.name}</span>
                <button onClick={() => handleRemoveParticipant(org)} className='add_remove_button'>Remove</button>
              </div>
            ))}
          </div>
         
          <div className='event_content_13'>
            <label>
              <strong>Organizer Type:</strong>
              <select value={organizerType} className='input__field' onChange={(e) => setOrganizerType(e.target.value)}>
                <option value="">Select Organizer Type</option>
                <option value="Person">Person</option>
                <option value="Organization">Organization</option>
                <option value="School">School</option>
              </select>
            </label>
          </div>
          <div className='event_content_14'>
            <label>
              <strong>Organizer Name:</strong>
              <input type="text" value={organizerName} className='input__field' onChange={(e) => setOrganizerName(e.target.value)} />
            </label>
          </div>
         </div>
         </div>
         </div>
         <button onClick={handleEventCreate} className='create_close_button'>Create</button>
         

       </>
     )}
   </Modal>   
    </div>
  );
};

export default CreateEvent;
