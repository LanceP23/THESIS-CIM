import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
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

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css' // needs additional webpack config!
import { UserContext } from '../../context/userContext';

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
    width: '80%',
    maxWidth: '80%',
    padding: '20px',
    textAlign: 'center',
    zIndex: 1001, 
    maxHeight: '100vh', // Maximum height for modal content
    backgroundImage: 'linear-gradient(to right,white ,#98D08F)', // Add gradient background
    borderRadius: '30px', // Add border radius property
    
    
    
    
  },
};


const CreateEvent = ({ defaultSelectable = true }) => {
  const {user} = useContext(UserContext);
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

  const [selectable, setSelectable] = useState(defaultSelectable);
  const [error, setError] = useState(null);
  const [adminCommunities, setAdminCommunities] = useState([]);
  const [viewCommunityId, setViewCommunityId] = useState(null);
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [participantCommunities, setParticipantCommunities] = useState([]);


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
            viewCommunityId: event.viewCommunityId,
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
      const response = await axios.get('/organization');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAdminCommunities = async () => {
      try {
        const token = getToken();
        const response = await axios.get('/view-community', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const userCommunities = response.data.filter(community => {
          return community.members.some(member => member.userId === user.id && member.role === 'admin');
        });
  
        setAdminCommunities(userCommunities);
  
        // Set the initial viewCommunityId to the first community ID if available
        if (userCommunities.length > 0) {
          setViewCommunityId(userCommunities[0]._id);
        }
  
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
  
    fetchAdminCommunities();
  }, [user]);
  

  const handleEventTypeChange = (value) => {
    setEventType(value);
  };

  const handleCommunityChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    const newSelectedCommunities = selectedOptions.map(id => adminCommunities.find(community => community._id === id));
    setSelectedCommunities(prevSelectedCommunities => {
      const isAlreadySelected = prevSelectedCommunities.some(selectedCommunity => selectedCommunity._id === newSelectedCommunities[0]._id);
      return isAlreadySelected ? prevSelectedCommunities.filter(selectedCommunity => selectedCommunity._id !== newSelectedCommunities[0]._id) : [...prevSelectedCommunities, ...newSelectedCommunities];
    });
  };

  const handleRemoveCommunity = (community) => {
    setSelectedCommunities(prevSelectedCommunities => prevSelectedCommunities.filter(selectedCommunity => selectedCommunity._id !== community._id));
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
      
        // Add selected organizations
        selectedParticipantOrganizations.forEach(org => {
          participantsToSend.push({
            id: org.id,
            name: org.name,
            type: 'organizational'
          });
        });
      }
      if (eventType === 'specialized') {
        participantsToSend = participantsToSend.concat(selectedCommunities.map(community => ({
          id: community._id,
          name: community.name,
          type: 'community'
        })));
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
      toast.dismiss();
      toast.success('Event Creation Successful!')
    } catch (error) {
      toast.dismiss();
      console.error('Error creating event:', error);
      toast.error('Event Creation Failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEvent = async (event) => {
    try {
      setSubmitting(true);
      toast.loading('Updating Event...');
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
  
        // Add selected organizations
        selectedParticipantOrganizations.forEach(org => {
          participantsToSend.push({
            id: org.id,
            name: org.name,
            type: 'organizational'
          });
        });
      }
      const response = await axios.put(
        `/update-event/${selectedEvent.id}`,
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
      toast.dismiss();
      toast.success('Event Update Successful!')
    } catch (error) {
      toast.dismiss();
      console.error('Error updating event:', error);
      toast.error('Event Update Failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    try {
      setSubmitting(true);
      toast.loading('Deleting Event...');
      const token = getToken();
      await axios.delete(
        `/delete-event/${selectedEvent.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
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
      toast.dismiss();
      toast.success('Event Deletion Successful!')
    } catch (error) {
      toast.dismiss();
      console.error('Error deleting event:', error);
      toast.error('Event Deletion Failed', error);
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
    if (!selectedParticipantOrganizations.some(selectedOrg => selectedOrg._id === org._id)) {
      setSelectedParticipantOrganizations(prevSelectedOrgs => [...prevSelectedOrgs, org]);
      setParticipants(prevParticipants => [...prevParticipants, { name: org.name, section: '', members: [] }]);
    } else {
      toast.error('Organization already selected');
      return;
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

const handleSelectEvent = (event) => {
  setSelectedEvent(event);
  setModalIsOpen(true);
  setModalMode('details');
};





  return (
    <div>

      

{!loading && (
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, ]}
        initialView="dayGridMonth" 
        
        events={events}
        eventClick={handleEventClick}
        selectable={selectable}
        select={handleDateSelect}
        className="calendar_component"
      />
    )}
      
      

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
    <div className='bg-grey-100 p-2 rounded-md '>
      
     
      <h2 className='text-4xl text-gray-600 border-b-2 border-gray-800 mb-3 text-left'>Event Details</h2>

        <div className="   p-2 flex flex-1 flex-row justify-between column-gap-2 rounded-lg shadow-md shadow-black">
        <div className="    w-6/12 p-2 rounded-md  shadow-black flex flex-col row-gap-1">
          
            <div className=" bg-slate-400 border-2 border-base-100 p-3 shadow-inner rounded-lg  animate-fade-in">
                <div className=" flex justify-center items-center ">
                  <label className=' text-lg text-white'> Event Name: </label> <label className='  p-2 rounded-md text-xl  font-extrabold italic '> {selectedEvent.title}</label>
                </div>

                <div className="flex justify-center items-center mx-1">
                    <div className="div mx-1 p-0 border rounded-lg shadow-2xl transition-transform duration-300 ease-in-out transform hover:scale-110">
                      <label className='text-white'>Start Date:</label>  <label className='p-2 rounded-md text-xl  font-extrabold italic  '>{moment(selectedEvent.start).format('YYYY-MM-DD HH:mm:ss')}</label>
                    </div>
                    <div className="div mx-1 p-0 border rounded-lg shadow-2xl transition-transform duration-300 ease-in-out transform hover:scale-110">
                      <label className='text-white'>End Date:</label> <label className='p-2 rounded-md text-xl  font-extrabold italic  '> {moment(selectedEvent.end).format('YYYY-MM-DD HH:mm:ss')}</label>
                    </div>
                </div>
            </div>

            <div className="bg-slate-400 border p-3 shadow-2xl rounded-sm animate-fade-in ">
      <div className="flex my-1 ">
      <label><strong className='text-white'>Event Type:</strong></label>  <label className=' '>{selectedEvent.extendedProps.eventType}</label>
      </div>


      <div className="flex flex-row justify-start items-center my-3 animate-fade-in ">
      <div className="flex my-3 mx-1">
      <label> <strong className='text-white'>Organizer Type: </strong> </label><label className=''> {selectedEvent.extendedProps.organizerType}</label> 
      </div>
    

      <div className="flex my-2">
      <p><strong className='text-white mx-1'>Organizer Name:</strong></p> <label className=''> {selectedEvent.extendedProps.organizerName}</label>
      </div>
      </div>

      <div className="flex flex-row justify-start items-center my-3">

      <div className="flex my-3">
      <lab><strong className='text-white'>Committee: </strong></lab> <label className=''> {selectedEvent.extendedProps.committee}</label>
      </div>

      <div className="flex my-3 mx-2 ">
      <p> <strong className='text-white'>Committee Chairman: </strong></p> <label className=' '> {selectedEvent.extendedProps.committeeChairman}</label> 
      </div>
      </div>

      <div className="flex my-3">
      <p><strong className='text-white'>Location:  </strong></p> <label className=' '> {selectedEvent.extendedProps.location}</label>
      </div>

      <div className="flex my-3">
      <p> <strong className='text-white'>Budget:</strong></p> <label className=' '>{selectedEvent.extendedProps.budget}</label>
      </div>

      </div>
</div>  


<div className="divider divider-horizontal divider-success"></div>
<div className=" w-6/12 flex flex-col animate-fade-in  ">
    <h2 className=' border-b-2 border-gray-700'> <strong className=' text-gray-700 text-xl'>Participants: </strong></h2>
    {selectedEvent && selectedEvent.extendedProps && selectedEvent.extendedProps.participants && (
      
    <div className=' max-h-96 overflow-auto border-b-2 border-gray-700 py-2  '>
      

      <ul className=' '>
        {JSON.parse(selectedEvent.extendedProps.participants).map((participant, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>
            <div className=' m-2 p-2 bg-slate-50 rounded-md shadow-inner shadow-black'>
              <strong>Name:</strong> <h2 className=' bg-gray-300 p-2 rounded-md'>{participant.name}<br /></h2> 
              <strong>Section:</strong> <h2 className=' bg-gray-300 p-2 rounded-md'>{participant.section}<br /></h2> 
              <strong>Type:</strong>  <h2 className=' bg-gray-300 p-2 rounded-md'> {participant.type}<br /></h2>
              {participant.type !== 'individual' && participant.members && (
                  <div style={{ marginLeft: '20px' }}>
                    <strong>Members:</strong> <h2 className=' bg-gray-300 p-2 rounded-md'> {participant.members.join(', ')}</h2> 
                  </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      
    </div>


)}
   
</div>

</div>       
<div className="flex justify-end my-2">
<button onClick={closeModal} className='btn btn-error px-5 btn-wide '>Close</button>
</div>
    </div>

) : (
  <>
    <h2 className=' text-3xl'>Create Event on :  {selectedDate && ( 
     <h2 value={startDate} onChange={(e) => setStartDate(e.target.value)}> Start Date: <strong>{selectedDate.start} </strong>   </h2>
      )}</h2>
    <div className=' bg-gradient-to-r from-white to-green-200 flex flex-row justify-around rounded-xl p-3 shadow-inner shadow-xl animate-fade-in'>

     <div className=" flex flex-col text-left items-start">
      <div className=' flex flex-row'>
     
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
           className='input input-bordered input-success input-sm w-full text-white bg-base rounded-md shadow-xl'
         />
       
       </div>
       <div className='event_content_3'>
       <label>
         <strong>Start Time:</strong> 
       </label>
         <input type="time"  value={startTime} onChange={(e) => setStartTime(e.target.value)}  className='input input-bordered input-success input-sm  text-white mx-1'  />
      
      
       <label>
         <strong>End Time: </strong>
       </label>
         <input type="time"  value={endTime} onChange={(e) => setEndTime(e.target.value)}  className='input input-bordered input-success input-sm  text-white mx-1' />
       
     </div>
     <div className='event_content_2'>
       <label>
         <strong>Event Name:</strong>
         <input type="text" className='input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-xl' value={eventName} onChange={(e) => setEventName(e.target.value)} />
       </label>
     </div>
     
     <div className='event_content_11'>
       <label>
         <strong>Location:</strong>
         <input type="text" className='input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-xl' value={location} onChange={(e) => setLocation(e.target.value)} />
       </label>
     </div>

     <div className='event_content_9'>
       <label>
         <strong>Committee:</strong>
         <input type="text" className='input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-xl' value={committee} onChange={(e) => setCommittee(e.target.value)} />
       </label>
     </div>
     <div className='event_content_10'>
       <label>
         <strong>Committee Chairman:</strong>
         <input type="text" className='input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-xl' value={committeeChairman} onChange={(e) => setCommitteeChairman(e.target.value)} />
       </label>
     </div>
     
     <div className='event_content_12'>
       <label>
         <strong>Budget:</strong>
         <input type="text" className='input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-xl' value={budget} onChange={(e) => setBudget(e.target.value)} />
       </label>
     </div>

     </div>

     <div className="divider divider-horizontal divider-success"></div>

     <div className="second_column">
     <div className="  border-black flex flex-col justify-start text-left overflow-auto max-w-full max-h-96 p-3">
     <div className='event_content_4'>
       <label>
         <strong>Event Type:</strong>
         <select value={eventType} className='flex flex-row w-full mt-1 mx-3 py-2 px-3 border border-green-300 bg-white rounded-md shadow-md ' onChange={(e) => setEventType(e.target.value)}>
           <option value="">Select Event Type</option>
           <option value="institutional">Institutional</option>
           <option value="organizational">Organizational</option>
           <option value="specialized">Specialized</option>
         </select>
       </label>
     </div>
     {["institutional", "structural"].includes(eventType) && (
       <div className='event_content_5'>
         <label>
           <strong>Participant Type:</strong>
           <select value={participantType} className='flex flex-row w-full mt-1 mx-3 py-2 px-3 border border-green-300 bg-white rounded-md shadow-md ' onChange={(e) => setParticipantType(e.target.value)}>
             <option value="individual">Individual</option>
             <option value="group">Group</option>
           </select>
         </label>
         {participantType === 'individual' && (
           <div className='event_content_6'>
             {participants.map((participant, index) => (
               <div key={index} className=' border shadow-lg my-1 p-1'>
                 <label>
                   <strong>Participant Name:</strong>
                   <input type="text" value={participant.name} className='file-input file-input-bordered file-input-success file-input-sm w-52  max-w-xs mx-5 bg-white rounded-md shadow-xl' onChange={(e) => handleParticipantChange(index, 'name', e.target.value)} />
                 </label>
                 <label>
                   <strong>Section:</strong>
                   <input type="text" value={participant.section} className='file-input file-input-bordered file-input-success file-input-sm w-52 max-w-xs mx-5 bg-white rounded-md shadow-xl' onChange={(e) => handleParticipantChange(index, 'section', e.target.value)} />
                 </label>
                 <button onClick={() => removeParticipant(index)} className='btn btn-error my-1'>Remove Participant</button>
               </div>
             ))}
             <button onClick={addParticipant} className='btn btn-success float-end'>Add Participant</button>
           </div>
         )}
         {participantType === 'group' && (
           <div className='event_content_7'>
             {participants.map((participant, index) => (
               <div key={index} className=''>
                 <div className="border-1 shadow-lg p-1 m-1">
                 <label>
                   <strong>Group Name:</strong>
                   <input type="text" value={participant.name} className='file-input file-input-bordered file-input-success file-input-sm w-full max-w-xs mx-5 bg-white rounded-md shadow-xl' onChange={(e) => handleParticipantChange(index, 'name', e.target.value)} />
                 </label>
                 <label>
                   <strong>Section:</strong>
                   <input type="text" value={participant.section} className='file-input file-input-bordered file-input-success file-input-sm w-full max-w-xs mx-5 bg-white rounded-md shadow-xl' onChange={(e) => handleParticipantChange(index, 'section', e.target.value)} />
                 </label>

                 </div>
                 <div>
                   <div className="border-1 shadow-lg p-1 m-1">
                   <strong>Members:</strong> <br></br>
                   {participant.members.map((member, memberIndex) => (
                     <input key={memberIndex} type="text" className='m-1 file-input file-input-bordered file-input-success file-input-sm w- max-w-xs mx-5 bg-white rounded-md shadow-xl ' value={member} onChange={(e) => handleMemberChange(index, memberIndex, e.target.value)} />
                   ))}
                   </div>
                   <button onClick={() => handleParticipantChange(index, 'members', [...participant.members, ''])} className='btn btn-success btn-xs m-1'>Add Member</button>
                 </div>
                 <button onClick={() => handleRemoveParticipant(index)} className='btn btn-error m-1'>Remove Participant</button>
               </div>
             ))}
             <button onClick={addGroup} className='btn btn-success'>Add Group</button>
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
       </div>
     )}
  {eventType === 'specialized' && (
       <div className="event_content_8">
         <label htmlFor="participantCommunity"><strong>Participant Community:</strong></label>
         <select id="participantCommunity" multiple value={selectedCommunities.map(community => community._id)} onChange={handleCommunityChange}>
           {adminCommunities.map(community => (
             <option key={community._id} value={community._id}>{community.name}</option>
           ))}
         </select>
         {selectedCommunities.length > 0 && (
           <div>
             <strong>Selected Communities:</strong>
             <div className="border-1">
             <ul className=''>
               {selectedCommunities.map(community => (
                 <h2 key={community._id} className='m-1 text-green-500 font-semibold'>
                   {community.name}
                   <button onClick={() => handleRemoveCommunity(community)} className='btn btn-error btn-sm ml-1'>Remove</button>
                 </h2>
               ))}
             </ul>

             </div>
           </div>
         )}
       </div>
     )}
     <div className="selected-participants">
       <strong>Selected Participants:</strong>
       {selectedParticipantOrganizations.map(org => (
         
         <div key={org.id} className='border-1 m-1 shadow-lg text-center'>
           <span className='text-green-500 font-extrabold italic mr-8'>{org.name}</span>
           <button onClick={() => handleRemoveParticipant(org)} className='btn btn-error mx-1 justify-end'>Remove</button>
         </div>
       ))}
     </div>
    
     <div className='event_content_13'>
       <label>
         <strong>Organizer Type:</strong>
         <select value={organizerType} className='flex flex-row w-full mt-1 mx-3 py-2 px-3 border border-green-300 bg-white rounded-md shadow-md' onChange={(e) => setOrganizerType(e.target.value)}>
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
         <input type="text" value={organizerName} className='file-input file-input-bordered file-input-success file-input-sm w-full max-w-xs mx-5 bg-white rounded-md shadow-xl' onChange={(e) => setOrganizerName(e.target.value)} />
       </label>
     </div>
    </div>
    </div>
    </div>
    <button onClick={handleEventCreate} className='btn btn-success float-end btn-md p3 m-4 btn-wide'>Create</button>
    

  </>
)}
</Modal>   
</div>
);
};

export default CreateEvent;
