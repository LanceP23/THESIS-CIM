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
    width: '50%',
    maxWidth: '500px',
    padding: '20px',
    textAlign: 'center',
    zIndex: 1001, 
    maxHeight: '80vh', // Maximum height for modal content
    overflowY: 'auto', // Enable vertical scrolling
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
          start: `${startDate}T${startTime}`,
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
  return (
    <div>
      <button onClick={() => {setModalMode('add'); setModalIsOpen(true);}} className='_button'>Add Event</button>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick} 
      />

     <Modal
     isOpen={modalIsOpen}
     onRequestClose={() => setModalIsOpen(false)}
     style={customStyles}
     contentLabel="Event Details Modal"
   >
     { modalMode === 'details' && selectedEvent ? (
    <>
      <h2>Event Details</h2>
      <p>Title: {selectedEvent.title}</p>
      <p>Start: {moment(selectedEvent.start).format('LLL')}</p>
      <p>End: {moment(selectedEvent.end).format('LLL')}</p>
      <p>Event Type: {selectedEvent.extendedProps.eventType}</p>
      <p>Organizer Type: {selectedEvent.extendedProps.organizerType}</p>
      <p>Organizer Name: {selectedEvent.extendedProps.organizerName}</p>
      <p>Committee: {selectedEvent.extendedProps.committee}</p>
      <p>Committee Chairman: {selectedEvent.extendedProps.committeeChairman}</p>
      <p>Location: {selectedEvent.extendedProps.location}</p>
      <p>Budget: {selectedEvent.extendedProps.budget}</p>
      {selectedEvent && selectedEvent.extendedProps && selectedEvent.extendedProps.participants && (
  <>
    <p>Participants: {JSON.stringify(selectedEvent.extendedProps.participants)}</p>
  </> 
)}
         <button onClick={() => setModalIsOpen(false)}>Close</button>
       </>
     ) : (
       <>
         <h2>Create Event</h2>
         <div className='display_event_container'>
           <div className='event_content_1'>
            <label>
              <strong>Event Name:</strong>
              <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
            </label>
          </div>
          <div className='event_content_2'>
            <label>
              <strong> Start Date:</strong>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>
              <strong>Start Time:</strong>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
          </div>
          <div className='event_content_3'>
            <label>
              <strong> End Date:</strong>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
            <label>
              <strong>End Time:</strong>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>
          </div>
          <div className='event_content_4'>
            <label>
              <strong>Event Type:</strong>
              <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
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
                <select value={participantType} onChange={(e) => setParticipantType(e.target.value)}>
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </label>
              {participantType === 'individual' && (
                <div>
                  {participants.map((participant, index) => (
                    <div key={index}>
                      <label>
                        <strong>Participant Name:</strong>
                        <input type="text" value={participant.name} onChange={(e) => handleParticipantChange(index, 'name', e.target.value)} />
                      </label>
                      <label>
                        <strong>Section:</strong>
                        <input type="text" value={participant.section} onChange={(e) => handleParticipantChange(index, 'section', e.target.value)} />
                      </label>
                      <button onClick={() => removeParticipant(index)}>Remove Participant</button>
                    </div>
                  ))}
                  <button onClick={addParticipant}>Add Participant</button>
                </div>
              )}
              {participantType === 'group' && (
                <div>
                  {participants.map((participant, index) => (
                    <div key={index}>
                      <label>
                        <strong>Group Name:</strong>
                        <input type="text" value={participant.name} onChange={(e) => handleParticipantChange(index, 'name', e.target.value)} />
                      </label>
                      <label>
                        <strong>Section:</strong>
                        <input type="text" value={participant.section} onChange={(e) => handleParticipantChange(index, 'section', e.target.value)} />
                      </label>
                      <div>
                        <strong>Members:</strong>
                        {participant.members.map((member, memberIndex) => (
                          <input key={memberIndex} type="text" value={member} onChange={(e) => handleMemberChange(index, memberIndex, e.target.value)} />
                        ))}
                        <button onClick={() => handleParticipantChange(index, 'members', [...participant.members, ''])}>Add Member</button>
                      </div>
                      <button onClick={() => handleRemoveParticipant(index)}>Remove Participant</button>
                    </div>
                  ))}
                  <button onClick={addGroup}>Add Group</button>
                </div>
              )}
            </div>
          )}
          
          {eventType === 'organizational' && (
            <div className='event_content_5'>
              <label>
                <strong>Participant Organizations:</strong>
                <select multiple value={participantOrganizations} onChange={(e) => {const selectedOptions = Array.from(e.target.selectedOptions, option => option.value); setParticipantOrganizations(selectedOptions);}}>
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
                <button onClick={() => handleRemoveParticipant(org)}>Remove</button>
              </div>
            ))}
          </div>
          <div className='event_content_6'>
            <label>
              <strong>Committee:</strong>
              <input type="text" value={committee} onChange={(e) => setCommittee(e.target.value)} />
            </label>
          </div>
          <div className='event_content_7'>
            <label>
              <strong>Committee Chairman:</strong>
              <input type="text" value={committeeChairman} onChange={(e) => setCommitteeChairman(e.target.value)} />
            </label>
          </div>
          <div className='event_content_8'>
            <label>
              <strong>Location:</strong>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </label>
          </div>
          <div className='event_content_9'>
            <label>
              <strong>Budget:</strong>
              <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </label>
          </div>
          <div className='event_content_10'>
            <label>
              <strong>Organizer Type:</strong>
              <select value={organizerType} onChange={(e) => setOrganizerType(e.target.value)}>
                <option value="">Select Organizer Type</option>
                <option value="Person">Person</option>
                <option value="Organization">Organization</option>
                <option value="School">School</option>
              </select>
            </label>
          </div>
          <div className='event_content_11'>
            <label>
              <strong>Organizer Name:</strong>
              <input type="text" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} />
            </label>
          </div>
         </div>
         <button onClick={handleEventCreate} className='create_close_button'>Create</button>
         <button onClick={closeModal} className='create_close_button'>Close</button>
       </>
     )}
   </Modal>   
    </div>
  );
};

export default CreateEvent;
